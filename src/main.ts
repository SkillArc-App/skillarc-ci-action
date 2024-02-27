import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const example: string = core.getInput('example')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`The example input ${example}`)

    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())

    const payload = JSON.stringify(github.context.payload, undefined, 2)
    core.debug(`The event payload: ${payload}`);

    // Set outputs for other workflow steps to use
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
