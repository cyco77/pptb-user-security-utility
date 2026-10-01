import { SystemUser } from "../types/systemUser";
import { Team } from "../types/team";
import { SecurityRole } from "../types/securityRole";
import { Queue } from "../types/queue";
import { AssignmentSource } from "../types/assignment";
import { FieldSecurityProfile } from "../types/fieldSecurityProfile";
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
    sources: [{ type: "direct" }],
    businessunitid: record.businessunitid
      ? {
          businessunitid: record.businessunitid.businessunitid,
          name: record.businessunitid.name,
        }
      : undefined,
  }));
};

export const loadFieldSecurityProfilesForUser = async (
  systemUserId: string
): Promise<FieldSecurityProfile[]> => {
  const url = `systemusers(${systemUserId})/systemuserprofiles_association?$select=fieldsecurityprofileid,name,description,ismanaged`;
  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    fieldsecurityprofileid: record.fieldsecurityprofileid,
    name: record.name,
    description: record.description,
    ismanaged: record.ismanaged,
    sources: [{ type: "direct" }],
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
    sources: [],
    businessunitid: record.businessunitid
      ? {
          businessunitid: record.businessunitid.businessunitid,
          name: record.businessunitid.name,
        }
      : undefined,
  }));
};

export const loadSecurityRolesForTeamWithSource = async (
  team: Team
): Promise<SecurityRole[]> => {
  const roles = await loadSecurityRolesForTeam(team.teamid);
  return roles.map((role) => ({
    ...role,
    sources: [
      {
        type: "team",
        teamId: team.teamid,
        teamName: team.name,
      },
    ],
  }));
};

export const loadFieldSecurityProfilesForTeam = async (
  team: Team
): Promise<FieldSecurityProfile[]> => {
  const url = `teams(${team.teamid})/teamprofiles_association?$select=fieldsecurityprofileid,name,description,ismanaged`;
  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    fieldsecurityprofileid: record.fieldsecurityprofileid,
    name: record.name,
    description: record.description,
    ismanaged: record.ismanaged,
    sources: [
      {
        type: "team",
        teamId: team.teamid,
        teamName: team.name,
      },
    ],
  }));
};

const mergeAssignments = <T extends { [key: string]: any }>(
  assignments: T[],
  idProperty: string,
): T[] => {
  const merged = new Map<string, T>();
  assignments.forEach((assignment) => {
    const id = assignment[idProperty];
    const existing = merged.get(id);
    if (!existing) {
      merged.set(id, assignment);
      return;
    }

    const sources = [...existing.sources, ...assignment.sources].filter(
      (source: AssignmentSource, index: number, all: AssignmentSource[]) =>
        all.findIndex((candidate) =>
          candidate.type === "direct" && source.type === "direct"
            ? true
            : candidate.type === "team" &&
              source.type === "team" &&
              candidate.teamId === source.teamId,
        ) === index,
    );
    merged.set(id, { ...existing, sources });
  });
  return Array.from(merged.values());
};

export const loadEffectiveSecurityRolesForUser = async (
  systemUserId: string,
  teams: Team[],
): Promise<SecurityRole[]> => {
  const [directRoles, teamRoles] = await Promise.all([
    loadSecurityRolesForUser(systemUserId),
    Promise.all(teams.map(loadSecurityRolesForTeamWithSource)),
  ]);
  return mergeAssignments(
    [...directRoles, ...teamRoles.flat()],
    "roleid",
  );
};

export const loadEffectiveFieldSecurityProfilesForUser = async (
  systemUserId: string,
  teams: Team[],
): Promise<FieldSecurityProfile[]> => {
  const [directProfiles, teamProfiles] = await Promise.all([
    loadFieldSecurityProfilesForUser(systemUserId),
    Promise.all(teams.map(loadFieldSecurityProfilesForTeam)),
  ]);
  return mergeAssignments(
    [...directProfiles, ...teamProfiles.flat()],
    "fieldsecurityprofileid",
  );
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

export const loadUsersForTeam = async (
  teamId: string
): Promise<SystemUser[]> => {
  const url = `teams(${teamId})/teammembership_association?$select=systemuserid,fullname,domainname,isdisabled,applicationid&$expand=businessunitid($select=businessunitid,name)`;

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

export const loadQueuesForUser = async (
  systemUserId: string
): Promise<Queue[]> => {
  const url = `systemusers(${systemUserId})/queuemembership_association?$select=queueid,name,queuetypecode&$orderby=name`;

  const allRecords = await loadAllData(url);

  return allRecords.map((record: any) => ({
    queueid: record.queueid,
    name: record.name,
    queuetypecode: record.queuetypecode,
  }));
};
