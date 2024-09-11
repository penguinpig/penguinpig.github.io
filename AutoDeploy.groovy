pipeline{    
    agent {
        node {
            label 'master'
        }
    }
    stages {
        stage('Checkout') {
            steps {
                git(url: 'git@github.com:penguinpig/penguinpig.github.io.git', branch: 'dev')
            }
        }
        stage('Build') {
            steps {
                sh 'sh AutoDeploy.sh'
            }
        }
        stage('Delivery') {
            steps {
                sh 'echo \'Publish artifact over SSH.\''
            }
        }
    }
}