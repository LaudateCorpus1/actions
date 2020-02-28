# @chesscom/actions

### WIP Status Blocker
Purposely fail a job if a specific label is preset on the pull request. No more wasting build minutes on a pull request that has a WIP label attached to it.

```yml
- uses: chesscom/actions/wip-status-blocker@<ref>
  with:
    label: 'WIP' # <- default
```
