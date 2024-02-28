import * as core from '@actions/core'
import { Octokit } from '@octokit/action'
import * as github from '@actions/github'
import { getCurrentJob } from './jobs'
const octokit: Octokit = new Octokit()

async function wait(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export async function run(): Promise<void> {
  try {
    const seconds = Number.parseInt(core.getInput('alert_threshold'))

    await wait(1000)
    const currentJob = await getCurrentJob()

    if (!currentJob) {
      core.error(
        `Couldn't find current job. So action will not report any data.`
      )
      return
    }

    const steps =
      currentJob.steps?.filter(step => {
        step.status === 'completed'
      }) ?? []

    if (steps.length) {
      const startTime = steps[0].started_at
      const endTime = steps[steps.length - 1].completed_at

      if (startTime && endTime) {
        const totalTime = Date.parse(endTime) - Date.parse(startTime)

        if (totalTime / 1000 > seconds) {
          const { repo, issue } = github.context

          octokit.rest.issues.createComment({
            issue_number: issue.number,
            owner: repo.owner,
            repo: repo.repo,
            body: `Job runtime ${currentJob.name} for has exceeded maximum runtime of ${seconds} seconds. \nReview the run [here](${currentJob.run_url})`
          })
        }

        core.info(`Current job: ${JSON.stringify(currentJob)}`)
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(error.message)
    } else {
      core.error('Unknown error')
    }
  }
}

run()
