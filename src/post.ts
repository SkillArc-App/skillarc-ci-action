import * as core from '@actions/core'
import { getCurrentJob } from './jobs'

export async function run(): Promise<void> {
  try {
    const currentJob = await getCurrentJob()

    if (!currentJob) {
      core.error(
        `Couldn't find current job. So action will not report any data.`
      )
      return
    }

    console.log(`Current job: ${JSON.stringify(currentJob)}`)
    core.info(`Current job: ${JSON.stringify(currentJob)}`)
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(error.message)
    } else {
      core.error('Unknown error')
    }
  }
}

run()
