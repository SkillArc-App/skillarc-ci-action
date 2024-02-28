import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/action'
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

    const steps = (currentJob.steps ?? []).filter(
      ({ status }) => status === 'completed'
    )

    if (
      steps.length > 0 &&
      steps.every(({ conclusion }) => conclusion === 'success')
    ) {
      const startTime = steps[0].started_at
      const endTime = steps[steps.length - 1].completed_at

      core.info(`start time: ${startTime}`)
      core.info(`end time: ${endTime}`)

      if (startTime && endTime) {
        const totalTime = Date.parse(endTime) - Date.parse(startTime)

        if (totalTime / 1000 > seconds) {
          const { repo, issue } = github.context

          const longestSteps = steps
            .map(({ name, completed_at, started_at }) => ({
              name,
              duration:
                Date.parse(completed_at as string) -
                Date.parse(started_at as string)
            }))
            .sort((a, b) => b.duration - a.duration)

          const lines: string[] = [
            `Job runtime ${currentJob.name} for has exceeded maximum runtime set of ${seconds.toString()} seconds.`,
            `Review the run [here](${currentJob.html_url})`,
            '',
            'Here are the longest steps',
            '|step|run time|',
            '|--|--|',
            ...longestSteps.map(
              ({ name, duration }) => `|${name}|${duration / 1000} seconds|`
            )
          ]

          octokit.rest.issues.createComment({
            issue_number: issue.number,
            owner: repo.owner,
            repo: repo.repo,
            body: lines.join('\n')
          })
        }
      }
    }

    core.info(`Current job: ${JSON.stringify(currentJob)}`)
    core.info(`steps: ${JSON.stringify(steps)}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(error.message)
    } else {
      core.error('Unknown error')
    }
  }
}

run()
