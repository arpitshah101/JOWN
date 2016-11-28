# Task Execution

## Description
The Application Developer must have the ability to execute predefined tasks based on certain established aliases (i.e. jown-email, etc.) and execute linux commands with the assumption that the working directory is as specified in the configurations file. The command would be provided as a part of a state's definition.

## Implementation Notes
The command/task can be extracted from the state's defintion. Thereafter, the server would need to do the following:
1. Check if command is an alias is a predefined command alias.
    * If true: parse as such
2. Other wise, treat as a general linux command string.

If the command alias is for a linux command or if the command is treated as a general linux command string, then the command should be executed as a child process of the server executing from the specified working directory.

Refer to: [child_process.exec(command[, options][, callback])](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)

```
    def executeTask(string command):
        if preDefCmnd(command):
            executePreDefCmnd(command)
        else:
            child_process.exec(command[, options], function(err) {
                if err:
                    process errors
                    return failure
                return success
            })
```