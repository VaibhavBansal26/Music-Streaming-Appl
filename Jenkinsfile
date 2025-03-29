pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'node23'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        // Replace with your desired image name and tag
        DOCKER_IMAGE = 'vaibhavbansal26/music-streaming-appl:latest'
        EKS_CLUSTER_NAME = 'music-eks-vb'
        AWS_REGION = 'us-east-1'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout from Git') {
            steps {
                // Update repository URL as needed
                git branch: 'main', url: 'https://github.com/VaibhavBansal26/Music-Streaming-Appl.git'
                sh 'ls -la'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                    $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectName=MusicStreamingAppl \
                        -Dsonar.projectKey=MusicStreamingAppl
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                // Example: Install frontend dependencies (modify as needed for other services)
                sh '''
                cd frontend
                ls -la
                if [ -f package.json ]; then
                    rm -rf node_modules package-lock.json
                    npm install
                else
                    echo "Error: package.json not found in frontend!"
                    exit 1
                fi
                '''
            }
        }

        stage('OWASP FS Scan') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }

        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs . > trivyfs.txt'
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                        sh '''
                        echo "Building Docker image for the frontend..."
                        # Build the Docker image from the frontend Dockerfile.
                        # You can add additional builds for adminService, songService, and userService as needed.
                        docker build --no-cache -t $DOCKER_IMAGE -f frontend/Dockerfile frontend

                        echo "Pushing Docker image to Docker Hub..."
                        docker push $DOCKER_IMAGE
                        '''
                    }
                }
            }
        }

        stage('Deploy to EKS Cluster') {
            steps {
                script {
                    sh '''
                    echo "Verifying AWS credentials..."
                    aws sts get-caller-identity

                    echo "Configuring kubectl for EKS cluster..."
                    aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION

                    echo "Verifying kubeconfig..."
                    kubectl config view

                    echo "Deploying application to EKS..."
                    # Apply your Kubernetes manifests.
                    # Adjust paths if your manifests are stored in a different location (e.g., k8s/ directory)
                    kubectl apply -f deployment.yml
                    kubectl apply -f service.yml

                    echo "Verifying deployment..."
                    kubectl get pods
                    kubectl get svc
                    '''
                }
            }
        }
    }

    post {
        always {
            emailext attachLog: true,
                     subject: "'${currentBuild.result}'",
                     body: "Project: ${env.JOB_NAME}<br/>" +
                           "Build Number: ${env.BUILD_NUMBER}<br/>" +
                           "URL: ${env.BUILD_URL}<br/>",
                     to: 'thesimpleguy03@gmail.com',
                     attachmentsPattern: 'trivyfs.txt'
        }
    }
}


// pipeline {
//     agent any

//     tools {
//         jdk 'jdk-17'
//         nodejs 'node-23'
//     }

//     environment {
//         SCANNER_HOME     = tool 'sonar-scanner'
//         EKS_CLUSTER_NAME = 'music-eks-vb'
//         AWS_REGION       = 'us-east-1'
//     }

//     stages {
//         stage('Clean Workspace') {
//             steps {
//                 cleanWs()
//             }
//         }
        
//         stage('Checkout from Git') {
//             steps {
//                 git branch: 'main', url: 'https://github.com/VaibhavBansal26/Music-Streaming-Appl.git'
//                 sh 'ls -la'
//             }
//         }
        
//         stage('Prepare Env Files') {
//             steps {
//                 sh '''
//                 echo "Preparing adminService/.env file..."
//                 mkdir -p adminService
//                 cat <<EOF > adminService/.env
// DB_URL=postgresql://neondb_owner:npg_9dcrN3VsXeiQ@ep-lucky-credit-a5p1gk2f-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
// PORT=5002
// User_URL=http://localhost:5001
// CLOUD_NAME=vaibhav-codexpress
// CLOUD_API_KEY=741674442584288
// CLOUD_API_SECRET=zKXBPyQhNzh8Uwjs9A7udvpMZjE
// REDIS_PASSWORD=g5StdPiNEIGFzZFkA6eyrUadzg6gEnXS
// REDIS_PORT=18636
// REDIS_HOST=redis-18636.c13.us-east-1-3.ec2.redns.redis-cloud.com
// EOF

//                 echo "Preparing userService/.env file..."
//                 mkdir -p userService
//                 cat <<EOF > userService/.env
// PORT=5001
// MONGO_URI=mongodb+srv://vaibhavbansal2020:vaibhav26@cluster0.2jmtnrw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// DB_NAME=music_stream
// JWT_SECRET=secret_vaibhav
// EOF

//                 echo "Preparing songService/.env file..."
//                 mkdir -p songService
//                 cat <<EOF > songService/.env
// PORT=5003
// DB_URL=postgresql://neondb_owner:npg_9dcrN3VsXeiQ@ep-lucky-credit-a5p1gk2f-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
// REDIS_PASSWORD=g5StdPiNEIGFzZFkA6eyrUadzg6gEnXS
// REDIS_PORT=18636
// REDIS_HOST=redis-18636.c13.us-east-1-3.ec2.redns.redis-cloud.com
// EOF

//                 echo "Preparing frontend/.env file..."
//                 mkdir -p frontend
//                 cat <<EOF > frontend/.env
// VITE_API_URL=http://localhost
// VITE_API_SONG_PORT=5003
// VITE_API_USER_PORT=5001
// VITE_API_ADMIN_PORT=5002
// EOF
//                 '''
//             }
//         }
        
//         stage('SonarQube Analysis') {
//             steps {
//                 withSonarQubeEnv('sonar-server') {
//                     sh """
//                     $SCANNER_HOME/bin/sonar-scanner \\
//                         -Dsonar.projectName=MusicStreamingAppl \\
//                         -Dsonar.projectKey=MusicStreamingAppl
//                     """
//                 }
//             }
//         }
        
//         stage('Quality Gate') {
//             steps {
//                 script {
//                     waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
//                 }
//             }
//         }
        
//         stage('Install Frontend Dependencies') {
//             steps {
//                 sh '''
//                 cd frontend
//                 ls -la
//                 if [ -f package.json ]; then
//                     rm -rf node_modules package-lock.json
//                     npm install
//                 else
//                     echo "Error: package.json not found in frontend!"
//                     exit 1
//                 fi
//                 cd ..
//                 '''
//             }
//         }
        
//         // stage('OWASP FS Scan') {
//         //     steps {
//         //         dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
//         //         dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
//         //     }
//         // }
        
//         // stage('Trivy FS Scan') {
//         //     steps {
//         //         sh 'trivy fs . > trivyfs.txt'
//         //     }
//         // }
        
//         stage('Docker Compose Build & Push') {
//             steps {
//                 script {
//                     withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
//                         sh '''
//                         echo "Building Docker images using docker compose..."
//                         docker-compose build --no-cache

//                         echo "Pushing Docker images using docker compose..."
//                         docker-compose push
//                         '''
//                     }
//                 }
//             }
//         }
        
//         stage('Deploy to EKS Cluster') {
//             steps {
//                 script {
//                     // Bind AWS credentials using withCredentials (provided by AWS Credentials Binding Plugin)
//                     withCredentials([[
//                         $class: 'AmazonWebServicesCredentialsBinding', 
//                         credentialsId: 'aws-creds', 
//                         accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
//                         secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
//                     ]]) {
//                         sh '''
//                         echo "Verifying AWS credentials..."
//                         aws sts get-caller-identity

//                         echo "Configuring kubectl for the EKS cluster..."
//                         aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION

//                         echo "Verifying kubeconfig..."
//                         kubectl config view

//                         echo "Deploying application to EKS..."
//                         kubectl apply -f Kubernetes/

//                         echo "Verifying deployment..."
//                         kubectl get pods
//                         kubectl get svc
//                         '''
//                     }
//                 }
//             }
//         }
//     }
    
//     // post {
//     //     always {
//     //         emailext attachLog: true,
//     //                  subject: "'${currentBuild.result}'",
//     //                  body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>URL: ${env.BUILD_URL}<br/>",
//     //                  to: 'thesimpleguy03@gmail.com',
//     //                  attachmentsPattern: 'trivyfs.txt'
//     //     }
//     // }
// }
