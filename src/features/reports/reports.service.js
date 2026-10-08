import { prisma } from '../../config/prisma.js';
export const reportsService={
  scope(auth){return auth.userType==='ADMIN'?{}:{branchId:auth.branchId};},
  async summary(auth){const where=this.scope(auth);const [customers,leads,policies,claims]=await Promise.all([prisma.customer.count({where}),prisma.lead.count({where}),prisma.policy.count({where}),prisma.claim.count({where})]);return {customers,leads,policies,claims};},
  async renewals(auth){const rows=await prisma.renewal.groupBy({by:['status'],where:this.scope(auth),_count:{_all:true}});return rows.map((r)=>({status:r.status,count:r._count._all}));},
  async commissions(auth){const rows=await prisma.commission.groupBy({by:['status'],where:this.scope(auth),_sum:{amount:true},_count:{_all:true}});return rows.map((r)=>({status:r.status,count:r._count._all,amount:r._sum.amount}));}
};
