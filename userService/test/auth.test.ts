import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_EMAILS = 'boss@example.com';

const users: any[] = [];

vi.mock('../src/model.js', () => ({
    User: {
        findOne: vi.fn(async ({ email }) => users.find((u) => u.email === email) ?? null),
        create: vi.fn(async (data) => {
            const user = { _id: String(users.length + 1), playlists: [], ...data };
            users.push(user);
            return user;
        }),
    },
}));

const { default: app } = await import('../src/app.js');

const valid = { name: 'Ann', email: 'ann@example.com', password: 'longenough1' };

beforeEach(() => {
    users.length = 0;
});

describe('POST /api/v1/user/registerUser', () => {
    it('ignores a client-supplied admin role', async () => {
        const res = await request(app)
            .post('/api/v1/user/registerUser')
            .send({ ...valid, role: 'admin' });
        expect(res.status).toBe(201);
        expect(res.body.user.role).toBe('user');
    });

    it('grants admin only to emails listed in ADMIN_EMAILS, and signs the role into the token', async () => {
        const res = await request(app)
            .post('/api/v1/user/registerUser')
            .send({ ...valid, email: 'Boss@Example.com' });
        expect(res.body.user.role).toBe('admin');
        const decoded = jwt.verify(res.body.token, 'test-secret') as jwt.JwtPayload;
        expect(decoded.role).toBe('admin');
    });

    it('never returns the password hash', async () => {
        const res = await request(app).post('/api/v1/user/registerUser').send(valid);
        expect(res.body.user.password).toBeUndefined();
    });

    it.each([
        [{ ...valid, name: '' }],
        [{ ...valid, email: 'not-an-email' }],
        [{ ...valid, password: 'short' }],
    ])('rejects invalid input %#', async (body) => {
        const res = await request(app).post('/api/v1/user/registerUser').send(body);
        expect(res.status).toBe(400);
    });

    it('rejects a duplicate email', async () => {
        await request(app).post('/api/v1/user/registerUser').send(valid);
        const res = await request(app).post('/api/v1/user/registerUser').send(valid);
        expect(res.status).toBe(400);
    });
});

describe('POST /api/v1/user/loginUser', () => {
    it('returns the same error for unknown user and wrong password', async () => {
        await request(app).post('/api/v1/user/registerUser').send(valid);
        const wrong = await request(app)
            .post('/api/v1/user/loginUser')
            .send({ email: valid.email, password: 'wrongpassword' });
        const unknown = await request(app)
            .post('/api/v1/user/loginUser')
            .send({ email: 'nobody@example.com', password: 'wrongpassword' });
        expect(wrong.status).toBe(400);
        expect(wrong.body).toEqual(unknown.body);
    });

    it('logs in with correct credentials without leaking the hash', async () => {
        await request(app).post('/api/v1/user/registerUser').send(valid);
        const res = await request(app)
            .post('/api/v1/user/loginUser')
            .send({ email: valid.email, password: valid.password });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeTruthy();
        expect(res.body.user.password).toBeUndefined();
    });
});

describe('admin promotion on login', () => {
    it('promotes an existing user whose email was added to ADMIN_EMAILS', async () => {
        const hash = (await import('bcryptjs')).default.hashSync('longenough1', 4);
        users.push({ _id: '9', name: 'Boss', email: 'boss@example.com', role: 'user', password: hash, playlists: [], save: vi.fn() });
        const res = await request(app)
            .post('/api/v1/user/loginUser')
            .send({ email: 'boss@example.com', password: 'longenough1' });
        expect(res.body.user.role).toBe('admin');
        expect(users[0].save).toHaveBeenCalled();
        const decoded = jwt.verify(res.body.token, 'test-secret') as jwt.JwtPayload;
        expect(decoded.role).toBe('admin');
    });
});

describe('auth middleware', () => {
    it('returns 401 without a token', async () => {
        const res = await request(app).get('/api/v1/user/getUserProfile');
        expect(res.status).toBe(401);
    });
});
