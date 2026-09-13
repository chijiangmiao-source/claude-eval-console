# syntax=docker/dockerfile:1

ARG CLAUDE_CODE_VERSION=2.1.269

FROM node:22-bookworm AS claude-installer
ARG CLAUDE_CODE_VERSION
RUN npm install --global "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
    && claude --version

FROM adminfather/benzhi-claude-code@sha256:f77014d9e56cd3db2ac96627a286814cb1aa9f0b4bb807bea98a01383c9bc4d8
ARG CLAUDE_CODE_VERSION
USER root
RUN rm -rf /usr/local/lib/node_modules/@anthropic-ai/claude-code
COPY --from=claude-installer --chown=root:root \
    /usr/local/lib/node_modules/@anthropic-ai/claude-code \
    /usr/local/lib/node_modules/@anthropic-ai/claude-code
RUN ln -sfn ../lib/node_modules/@anthropic-ai/claude-code/bin/claude.exe /usr/local/bin/claude \
    && claude --version | grep -F "${CLAUDE_CODE_VERSION} (Claude Code)"
USER node
