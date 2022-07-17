export async function getAuthToken(auth, installationId) {
  const result = await auth({
    type: "installation",
    installationId
  });
  return result.token
}
