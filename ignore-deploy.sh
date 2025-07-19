# Ignore the 'content' branch
if [[ "$VERCEL_GIT_COMMIT_REF" == "content" ]]; then exit 1; fi