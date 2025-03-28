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
