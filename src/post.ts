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

    core.info(`Current job: ${JSON.stringify(currentJob)}`)
  } catch (error: any) {
    core.error(error.message)
  }
}
