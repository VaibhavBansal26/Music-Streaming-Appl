pipeline {
    agent any

    tools {
        jdk 'jdk-17'
        nodejs 'node-23'
    }

    environment {
        SCANNER_HOME     = tool 'sonar-scanner'
        EKS_CLUSTER_NAME = 'music-eks-vb'
        AWS_REGION       = 'us-east-1'
        TAG              = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        
        stage('Checkout from Git') {
            steps {
                git branch: 'main', url: 'https://github.com/VaibhavBansal26/Music-Streaming-Appl.git'
                sh 'ls -la'
            }
        }
        
        stage('Prepare Env Files') {
            steps {
                // Secret-file credentials hold the .env contents; nothing is echoed to the log.
                withCredentials([file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')]) {
                    sh 'install -m 600 "$FRONTEND_ENV" frontend/.env'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh """
                    $SCANNER_HOME/bin/sonar-scanner \\
                        -Dsonar.projectName=MusicStreamingAppl \\
                        -Dsonar.projectKey=MusicStreamingAppl
                    """
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
        
        stage('Install Frontend Dependencies') {
            steps {
                sh '''
                cd frontend
                ls -la
                if [ -f package.json ]; then
                    npm ci
                else
                    echo "Error: package.json not found in frontend!"
                    exit 1
                fi
                cd ..
                '''
            }
        }
        
        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs --severity HIGH,CRITICAL --exit-code 0 . > trivyfs.txt'
                archiveArtifacts artifacts: 'trivyfs.txt', allowEmptyArchive: true
            }
        }

        stage('Docker Compose Build & Push') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-cred', toolName: 'docker') {
                        sh '''
                        docker-compose build
                        docker-compose push
                        '''
                    }
                }
            }
        }
        
        stage('Deploy to EKS Cluster') {
            steps {
                script {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-creds', 
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]]) {
                        sh '''
                        echo "Verifying AWS credentials..."
                        aws sts get-caller-identity
                        
                        echo "Configuring kubectl for the EKS cluster..."
                        aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION
                        
                        echo "Creating/updating secrets from Jenkins credentials..."
                        for svc in admin song user; do
                            kubectl create secret generic "$svc-env" --from-env-file="$(printenv ${svc}_ENV_FILE)" \\
                                --dry-run=client -o yaml | kubectl apply -f -
                        done

                        echo "Deploying Kubernetes manifests with image tag $TAG..."
                        sed "s/IMAGE_TAG/$TAG/g" Kubernetes/deployment.yml | kubectl apply -f -
                        kubectl apply -f Kubernetes/node-service.yml

                        kubectl rollout status deployment/music-streaming-appl-admin --timeout=180s
                        kubectl rollout status deployment/music-streaming-appl-song --timeout=180s
                        kubectl rollout status deployment/music-streaming-appl-user --timeout=180s
                        kubectl rollout status deployment/music-streaming-appl-frontend --timeout=180s

                        echo "Verifying deployment..."
                        kubectl get pods
                        kubectl get svc
                        kubectl get ingress
                        '''
                    }
                }
            }
        }
    }
    
    // post {
    //     always {
    //         emailext attachLog: true,
    //                  subject: "'${currentBuild.result}'",
    //                  body: "Project: ${env.JOB_NAME}<br/>Build Number: ${env.BUILD_NUMBER}<br/>URL: ${env.BUILD_URL}<br/>",
    //                  to: 'thesimpleguy03@gmail.com'
    //     }
    // }
}
