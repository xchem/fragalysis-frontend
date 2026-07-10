#!groovy​

// The 'xchem' Fragalysis Frontend Jenkinsfile.

pipeline {

  agent { label 'buildah-slave' }

  environment {
    // Slack channel for all notifications
    SLACK_BUILD_CHANNEL = 'dls-builds'
    // Slack channel to be used for errors/failures
    SLACK_ALERT_CHANNEL = 'dls-alerts'
  }

  stages {

    stage('Inspect') {
      steps {
        slackSend channel: "#${SLACK_BUILD_CHANNEL}",
                  message: "${JOB_NAME} build ${BUILD_NUMBER} - starting..."
        echo "Inspecting..."
      }
    }

    stage('Install') {
      steps {
        sh 'corepack enable'
        sh 'yarn install --immutable'
      }
    }

    stage('Unit Tests') {
      steps {
        sh 'yarn test:ci'
      }
    }

    stage('Build') {
      steps {
        sh 'yarn build'
      }
    }

    stage('Cypress Smoke') {
      steps {
        sh 'yarn cy:install'
        withEnv(["CYPRESS_BASE_URL=${env.CYPRESS_BASE_URL ?: 'https://fragalysis-simona-default.xchem-dev.diamond.ac.uk'}"]) {
          sh 'yarn cy:smoke'
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png,cypress/videos/**/*.mp4',
                           allowEmptyArchive: true,
                           fingerprint: true
        }
      }
    }

  }

  // Post-job actions.
  // See https://jenkins.io/doc/book/pipeline/syntax/#post
  post {

    success {
      slackSend channel: "#${SLACK_BUILD_CHANNEL}",
                color: 'good',
                message: "${JOB_NAME} build ${BUILD_NUMBER} - complete"
    }

    failure {
      slackSend channel: "#${SLACK_BUILD_CHANNEL}",
                color: 'danger',
                message: "${JOB_NAME} build ${env.BUILD_NUMBER} - failed (${BUILD_URL})"
      slackSend channel: "#${SLACK_ALERT_CHANNEL}",
                color: 'danger',
                message: "${JOB_NAME} build ${BUILD_NUMBER} - failed (${BUILD_URL})"
    }

    fixed {
      slackSend channel: "#${SLACK_ALERT_CHANNEL}",
                color: 'good',
                message: "${JOB_NAME} build - fixed"
    }

  }

}
