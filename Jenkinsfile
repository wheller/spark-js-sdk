ansiColor('xterm') {
  timestamps {
    timeout(90) {

      node("SPARK_JS_SDK_VALIDATING") {
        env.CONCURRENCY = 4
        env.NPM_CONFIG_REGISTRY = "http://engci-maven-master.cisco.com/artifactory/api/npm/webex-npm-group"
        env.ENABLE_VERBOSE_NETWORK_LOGGING = true
        env.SDK_ROOT_DIR=pwd

        DOCKER_CONTAINER_NAME = "${JOB_NAME}-${BUILD_NUMBER}-builder"

        DOCKER_ENV_FILE = "${env.WORKSPACE}/docker-env"
        ENV_FILE = "${env.WORKSPACE}/.env"

        DOCKER_RUN_OPTS = ''
        DOCKER_RUN_OPTS = "${DOCKER_RUN_OPTS} --env-file=${DOCKER_ENV_FILE}"
        DOCKER_RUN_OPTS = "${DOCKER_RUN_OPTS} --env-file=${ENV_FILE}"
        DOCKER_RUN_OPTS = "${DOCKER_RUN_OPTS} --rm"
        DOCKER_RUN_OPTS = "${DOCKER_RUN_OPTS} -e NPM_CONFIG_CACHE=${env.WORKSPACE}/.npm"
        DOCKER_RUN_OPTS = "${DOCKER_RUN_OPTS} --volumes-from=\$(hostname)"
        DOCKER_RUN_OPTS = "${DOCKER_RUN_OPTS} --user=\$(id -u):\$(id -g)"
        DOCKER_RUN_OPTS = "${DOCKER_RUN_OPTS} ${DOCKER_CONTAINER_NAME}"
        env.DOCKER_RUN_OPTS = DOCKER_RUN_OPTS

        def dockerEnv = ""
        if (env.ATLAS_SERVICE_URL != null) {
          dockerEnv+="ATLAS_SERVICE_URL=${env.ATLAS_SERVICE_URL}\n"
        }
        if (env.BUILD_NUMBER != null) {
          dockerEnv+="BUILD_NUMBER=${env.BUILD_NUMBER}\n"
        }
        if (env.CISCOSPARK_APPID_ORGID != null) {
          dockerEnv+="CISCOSPARK_APPID_ORGID=${env.CISCOSPARK_APPID_ORGID}\n"
        }
        if (env.CONVERSATION_SERVICE != null) {
          dockerEnv+="CONVERSATION_SERVICE=${env.CONVERSATION_SERVICE}\n"
        }
        if (env.COMMON_IDENTITY_OAUTH_SERVICE_URL != null) {
          dockerEnv+="COMMON_IDENTITY_OAUTH_SERVICE_URL=${env.COMMON_IDENTITY_OAUTH_SERVICE_URL}\n"
        }
        if (env.DEVICE_REGISTRATION_URL != null) {
          dockerEnv+="DEVICE_REGISTRATION_URL=${env.DEVICE_REGISTRATION_URL}\n"
        }
        if (env.ENABLE_NETWORK_LOGGING != null) {
          dockerEnv+="ENABLE_NETWORK_LOGGING=${env.ENABLE_NETWORK_LOGGING}\n"
        }
        if (env.ENABLE_VERBOSE_NETWORK_LOGGING != null) {
          dockerEnv+="ENABLE_VERBOSE_NETWORK_LOGGING=${env.ENABLE_VERBOSE_NETWORK_LOGGING}\n"
        }
        if (env.HYDRA_SERVICE_URL != null) {
          dockerEnv+="HYDRA_SERVICE_URL=${env.HYDRA_SERVICE_URL}\n"
        }
        if (env.PIPELINE != null) {
          dockerEnv+="PIPELINE=${env.PIPELINE}\n"
        }
        if (env.SAUCE_IS_DOWN != null) {
          dockerEnv+="SAUCE_IS_DOWN=${env.SAUCE_IS_DOWN}\n"
        }
        if (env.SDK_BUILD_DEBUG != null) {
          dockerEnv+="SDK_BUILD_DEBUG=${env.SDK_BUILD_DEBUG}\n"
        }
        if (env.SKIP_FLAKY_TESTS != null) {
          dockerEnv+="SKIP_FLAKY_TESTS=${env.SKIP_FLAKY_TESTS}\n"
        }
        if (env.WDM_SERVICE_URL != null) {
          dockerEnv+="WDM_SERVICE_URL=${env.WDM_SERVICE_URL}\n"
        }
        if (env.WORKSPACE != null) {
          dockerEnv+="WORKSPACE=${env.WORKSPACE}\n"
        }
        writeFile file: DOCKER_ENV_FILE, text: dockerEnv

        withCredentials([
          string(credentialsId: '9f44ab21-7e83-480d-8fb3-e6495bf7e9f3', variable: 'CISCOSPARK_CLIENT_SECRET'),
          string(credentialsId: 'CISCOSPARK_APPID_SECRET', variable: 'CISCOSPARK_APPID_SECRET'),
          usernamePassword(credentialsId: 'SAUCE_LABS_VALIDATED_MERGE_CREDENTIALS', passwordVariable: 'SAUCE_ACCESS_KEY', usernameVariable: 'SAUCE_USERNAME'),
          string(credentialsId: 'ddfd04fb-e00a-4df0-9250-9a7cb37bce0e', variable: 'COMMON_IDENTITY_CLIENT_SECRET')
        ]) {
          def secrets = ""
          secrets += "COMMON_IDENTITY_CLIENT_SECRET=${COMMON_IDENTITY_CLIENT_SECRET}"
          secrets += "CISCOSPARK_APPID_SECRET=${CISCOSPARK_APPID_SECRET}"
          secrets += "CISCOSPARK_CLIENT_SECRET=${CISCOSPARK_CLIENT_SECRET}"
          secrets += "SAUCE_USERNAME=${SAUCE_USERNAME}"
          secrets += "SAUCE_ACCESS_KEY=${SAUCE_ACCESS_KEY}"
          writeFile file: ENV_FILE, text: secrets
        }

        sh 'ls -al'
        sh "cat ${DOCKER_ENV_FILE}"
        sh "cat ${ENV_FILE}"

        stage('checkout') {
          checkout scm
        }

        stage('docker build') {
          sh 'echo "RUN groupadd -g $(id -g) jenkins" >> ./docker/builder/Dockerfile'
          sh 'echo "RUN useradd -u $(id -u) -g $(id -g) -m jenkins" >> ./docker/builder/Dockerfile'
          sh "echo 'WORKDIR ${env.WORKSPACE}' >> ./docker/builder/Dockerfile"
          sh 'echo "USER $(id -u)" >> ./docker/builder/Dockerfile'

          retry(3) {
            sh "docker build -t ${DOCKER_CONTAINER_NAME} ./docker/builder"
            // Reset the Dockerfile to make sure we don't accidentally commit it
            // later
            sh "git checkout ./docker/builder/Dockerfile"
          }
        }

        stage('install') {
          // sh "docker run ${DOCKER_RUN_OPTS} npm install"
          // sh "docker run ${DOCKER_RUN_OPTS} npm run bootstrap"
        }

        stage('clean') {
          // sh "docker run ${DOCKER_RUN_OPTS} npm run grunt -- clean"
          // sh "docker run ${DOCKER_RUN_OPTS} npm run grunt:concurrent -- clean"
          // sh "docker run ${DOCKER_RUN_OPTS} npm run clean-empty-packages"
          sh 'rm -rf ".sauce/*/sc.*"'
          sh 'rm -rf ".sauce/*/sauce_connect*log"'
          sh 'rm -rf reports'
          sh 'mkdir -p reports/coverage'
          sh 'mkdir -p reports/coverage-final'
          sh 'mkdir -p reports/junit'
          sh 'mkdir -p reports/logs'
          sh 'mkdir -p reports/sauce'
          sh 'chmod -R ugo+w reports'
        }

        stage('build') {
          // sh "docker run ${DOCKER_RUN_OPTS} npm run build"
        }

        stage('test') {
          sh "./tooling/test.sh"

          junit 'reports/junit/**/*.xml'
          echo currentBuild.result
        }

        if (currentBuild.result == 'SUCCESS') {
          stage('process coverage') {
            sh 'npm run grunt:circle -- coverage'

            // At the time this script was written, the cobertura plugin didn't
            // support pipelines, so we need to use a freeform job to process
            // code coverage
            coverageBuild = build job: 'spark-js-sdk--validated-merge--coverage-processor', propagate: false
            if (coverageBuild.result != 'SUCCESS') {
              currentBuild.result = coverageBuild.result
              if (coverageBuild.result == 'UNSTABLE') {
                currentBuild.description = "Code coverage decreased. See ${coverageBuild.url}"
              }
              else if (coverageBuild.result == 'FAILURE') {
                currentBuild.description = "Coverage job failed. See ${coverageBuild.url}"
              }
            }

          }

          noPushCount = sh script: '$(git log origin/master.. | grep -c "#no-push")', returnStdout: true
          if (noPushCount != '0') {
            currentBuild.result = 'ABORTED'
          }

          if (currentBuild.status == 'SUCCESS') {
            stage('publish to npm') {
              // NPM_TOKEN
            }

            stage('publish to ghe') {

            }

            stage('publish to artifactory') {

            }

            stage('publish to cdn') {

            }
          }
        }

        archive 'reports/**/*'
      }
    }
  }
}
// TODO always delete .env
