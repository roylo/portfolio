# Ignore the 'content' branch
echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"
if [[ "$VERCEL_GIT_COMMIT_REF" == "content" ]]; then exit 1; fi