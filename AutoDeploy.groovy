pipeline{    
    agent any
    
    stages {
        stage('Setting config'){
            steps{
                sh 'whoami'
                sh 'git config --list --show-origin'
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