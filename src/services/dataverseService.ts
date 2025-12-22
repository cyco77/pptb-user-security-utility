import { SystemUser } from "../types/systemUser";
import { Team } from "../types/team";
import { SecurityRole } from "../types/securityRole";
import { logger } from "./loggerService";

export const loadSystemUsers = async (): Promise<SystemUser[]> => {
  let url =
    "systemusers?$select=systemuserid,fullname,domainname,isdisabled,applicationid&$expand=businessunitid($select=businessunitid,name)&$orderby=fullname";

  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    systemuserid: record.systemuserid,
    fullname: record.fullname,
    domainname: record.domainname,
    isdisabled: record.isdisabled,
    applicationid: record.applicationid ?? null,
    businessunitid: record.businessunitid
      ? {
          businessunitid: record.businessunitid.businessunitid,
          name: record.businessunitid.name,
        }
      : undefined,
  }));
};

export const loadTeams = async (): Promise<Team[]> => {
  let url =
    "teams?$select=teamid,name,teamtype,isdefault&$expand=businessunitid($select=businessunitid,name)&$orderby=name";

  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    teamid: record.teamid,
    name: record.name,
    teamtype: record.teamtype,
    isdefault: record.isdefault,
    businessunitid: record.businessunitid
      ? {
          businessunitid: record.businessunitid.businessunitid,
          name: record.businessunitid.name,
        }
      : undefined,
  }));
};

const loadAllData = async (fullUrl: string) => {
  const allRecords = [];

  while (fullUrl) {
    logger.info(`Fetching data from URL: ${fullUrl}`);

    let relativePath = fullUrl;

    if (fullUrl.startsWith("http")) {
      const url = new URL(fullUrl);
      const apiRegex = /^\/api\/data\/v\d+\.\d+\//;
      relativePath = url.pathname.replace(apiRegex, "") + url.search;
    }

    logger.info(`Cleaned URL: ${relativePath}`);

    const response = await window.dataverseAPI.queryData(relativePath);

    // Add the current page of results
    allRecords.push(...response.value);

    // Check for paging link
    fullUrl = (response as any)["@odata.nextLink"] || null;
  }

  console.log(`Total records fetched: ${allRecords.length}`, allRecords);

  return allRecords;
};

export const loadSecurityRolesForUser = async (
  systemUserId: string
): Promise<SecurityRole[]> => {
  const url = `systemusers(${systemUserId})/systemuserroles_association?$select=roleid,name,ismanaged&$expand=businessunitid($select=businessunitid,name)`;

  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    roleid: record.roleid,
    name: record.name,
    ismanaged: record.ismanaged,
    businessunitid: record.businessunitid
      ? {
          businessunitid: record.businessunitid.businessunitid,
          name: record.businessunitid.name,
        }
      : undefined,
  }));
};

export const loadSecurityRolesForTeam = async (
  teamId: string
): Promise<SecurityRole[]> => {
  const url = `teams(${teamId})/teamroles_association?$select=roleid,name,ismanaged&$expand=businessunitid($select=businessunitid,name)`;

  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    roleid: record.roleid,
    name: record.name,
    ismanaged: record.ismanaged,
    businessunitid: record.businessunitid
      ? {
          businessunitid: record.businessunitid.businessunitid,
          name: record.businessunitid.name,
        }
      : undefined,
  }));
};

export const loadTeamsForUser = async (
  systemUserId: string
): Promise<Team[]> => {
  const url = `systemusers(${systemUserId})/teammembership_association?$select=teamid,name,teamtype,isdefault&$expand=businessunitid($select=businessunitid,name)`;

  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    teamid: record.teamid,
    name: record.name,
    teamtype: record.teamtype,
    isdefault: record.isdefault,
    businessunitid: record.businessunitid
      ? {
          businessunitid: record.businessunitid.businessunitid,
          name: record.businessunitid.name,
        }
      : undefined,
  }));
};
