#!groovy​

// The 'xchem' Fragalysis Frontend Jenkinsfile.

pipeline {

  agent { label 'buildah-slave' }

  environment {
    // Slack channel to be used for errors/failures
    SLACK_ALERT_CHANNEL = 'dls-alerts'
  }

  stages {

    stage('Inspect') {
      steps {
          echo "Inspecting..."
      }
    }

  }

  // Post-job actions.
  // See https://jenkins.io/doc/book/pipeline/syntax/#post
  post {

    failure {
      slackSend channel: "#${SLACK_ALERT_CHANNEL}",
              color: 'danger',
              message: "Fragalysis-Frontend build ${env.BUILD_NUMBER} - failed (${env.BUILD_URL})"
    }

    fixed {
      slackSend channel: "#${env.SLACK_ALERT_CHANNEL}",
              color: 'good',
              message: "Fragalysis-Frontend build - fixed"
    }

  }

}
