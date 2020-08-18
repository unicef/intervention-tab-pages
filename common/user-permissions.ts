export function userIsPme(user: any) {
  if (!user || !Array.isArray(user.groups)) {
    return false;
  }
  return !!user.groups.find((grp: any) => {
    return grp.name === 'PME';
  });
}
