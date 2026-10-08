export const getDataScope = (auth) => auth.userType === 'ADMIN' ? {} : { branchId: auth.branchId };
