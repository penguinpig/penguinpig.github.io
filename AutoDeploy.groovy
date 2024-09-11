pipeline{    
    agent any
    
    stages {
        stage('Setting config'){
            steps{
                sh 'git config --global user.email "penguinpig0120@gmail.com"'
                sh 'git config --global user.name  "Jenkins"'
            }
        }
        stage('Checkout') {
            steps {
                git(url: 'git@github.com:penguinpig/penguinpig.github.io.git', branch: 'dev')
            }
        }
        stage('Build & Deploy') {
            steps {
                sh 'sh AutoDeploy.sh'
            }
        }
        // stage('Delivery') {
        //     steps {
        //         sh 'echo \'Publish artifact over SSH.\''
        //     }
        // }
    }
}