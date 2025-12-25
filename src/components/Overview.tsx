import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  loadSystemUsers,
  loadTeams,
  loadSecurityRolesForUser,
  loadSecurityRolesForTeam,
  loadTeamsForUser,
  loadUsersForTeam,
  loadQueuesForUser,
} from "../services/dataverseService";
import { SystemUser } from "../types/systemUser";
import { Team } from "../types/team";
import { SecurityRole } from "../types/securityRole";
import { Queue } from "../types/queue";
import { Filter } from "./Filter";
import { DataGridView } from "./DataGridView";
import { SecurityRolesPanel } from "./SecurityRolesPanel";
import { makeStyles, Spinner, Text, Button } from "@fluentui/react-components";
import { DocumentCopyRegular, SaveRegular } from "@fluentui/react-icons";
import { logger } from "../services/loggerService";

interface IOverviewProps {
  connection: ToolBoxAPI.DataverseConnection | null;
}

export const Overview: React.FC<IOverviewProps> = ({ connection }) => {
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [entityType, setEntityType] = useState<"systemuser" | "team">(
    "systemuser"
  );
  const [textFilter, setTextFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "enabled" | "disabled"
  >("enabled");
  const [userTypeFilter, setUserTypeFilter] = useState<
    "all" | "users" | "applications"
  >("users");
  const [businessUnitFilter, setBusinessUnitFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [securityRoles, setSecurityRoles] = useState<SecurityRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [userQueues, setUserQueues] = useState<Queue[]>([]);
  const [isLoadingQueues, setIsLoadingQueues] = useState(false);
  const [teamMembers, setTeamMembers] = useState<SystemUser[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingMarkdown, setIsExportingMarkdown] = useState(false);

  const useStyles = makeStyles({
    overviewRoot: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      overflow: "hidden",
    },
    filterSection: {
      flexShrink: 0,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "16px",
    },
    buttonContainer: {
      display: "flex",
      gap: "8px",
      alignItems: "flex-end",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      flexDirection: "column",
      gap: "16px",
    },
    dataSection: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      overflow: "hidden",
      minHeight: 0,
      gap: "0px",
    },
    gridSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      minHeight: 0,
    },
  });

  const styles = useStyles();

  useEffect(() => {
    const initialize = async () => {
      if (!connection) {
        return;
      }
      await loadData();
    };

    initialize();
  }, [connection]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [users, teamsData] = await Promise.all([
        loadSystemUsers(),
        loadTeams(),
      ]);
      setSystemUsers(users);
      setTeams(teamsData);
      logger.info(
        `Fetched ${users.length} system users and ${teamsData.length} teams`
      );
    } catch (error) {
      logger.error(`Error loading data: ${(error as Error).message}`);
      await window.toolboxAPI.utils.showNotification({
        title: "Error Loading Data",
        body: `Failed to load data from Dataverse: ${(error as Error).message}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [connection]);

  const handleSelectionChange = useCallback(
    async (id: string | null) => {
      setSelectedId(id);

      if (!id) {
        setSecurityRoles([]);
        setUserTeams([]);
        setUserQueues([]);
        setTeamMembers([]);
        return;
      }

      setIsLoadingRoles(true);
      setSecurityRoles([]);

      if (entityType === "systemuser") {
        setIsLoadingTeams(true);
        setUserTeams([]);
        setIsLoadingQueues(true);
        setUserQueues([]);
      } else {
        setIsLoadingTeamMembers(true);
        setTeamMembers([]);
      }

      try {
        let roles: SecurityRole[] = [];
        if (entityType === "systemuser") {
          const [rolesData, teamsData, queuesData] = await Promise.all([
            loadSecurityRolesForUser(id),
            loadTeamsForUser(id),
            loadQueuesForUser(id),
          ]);
          roles = rolesData;
          setUserTeams(teamsData);
          setUserQueues(queuesData);
          logger.info(
            `Fetched ${roles.length} security roles, ${teamsData.length} teams, and ${queuesData.length} queues for user ${id}`
          );
        } else {
          const [rolesData, membersData] = await Promise.all([
            loadSecurityRolesForTeam(id),
            loadUsersForTeam(id),
          ]);
          roles = rolesData;
          setTeamMembers(membersData);
          logger.info(
            `Fetched ${roles.length} security roles and ${membersData.length} members for team ${id}`
          );
        }
        setSecurityRoles(roles);
      } catch (error) {
        logger.error(`Error loading data: ${(error as Error).message}`);
        await window.toolboxAPI.utils.showNotification({
          title: "Error Loading Details",
          body: `Failed to load security roles and related data: ${
            (error as Error).message
          }`,
          type: "error",
        });
      } finally {
        setIsLoadingRoles(false);
        if (entityType === "systemuser") {
          setIsLoadingTeams(false);
          setIsLoadingQueues(false);
        } else {
          setIsLoadingTeamMembers(false);
        }
      }
    },
    [entityType]
  );

  const filteredSystemUsers = useMemo(() => {
    let result = systemUsers;

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => {
        if (statusFilter === "enabled") {
          return !user.isdisabled;
        } else {
          return user.isdisabled;
        }
      });
    }

    // Apply user type filter
    if (userTypeFilter !== "all") {
      result = result.filter((user) => {
        if (userTypeFilter === "users") {
          return !user.applicationid; // Regular users have no applicationid
        } else {
          return !!user.applicationid; // Application users have applicationid
        }
      });
    }

    // Apply business unit filter
    if (businessUnitFilter !== "all") {
      result = result.filter(
        (user) => user.businessunitid?.businessunitid === businessUnitFilter
      );
    }

    // Apply text filter
    if (textFilter) {
      const searchTerm = textFilter.toLowerCase();
      result = result.filter((user) => {
        return (
          user.fullname?.toLowerCase().includes(searchTerm) ||
          user.domainname?.toLowerCase().includes(searchTerm) ||
          user.businessunitid?.name?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return result;
  }, [
    systemUsers,
    textFilter,
    statusFilter,
    userTypeFilter,
    businessUnitFilter,
  ]);

  const filteredTeams = useMemo(() => {
    let result = teams;

    // Apply business unit filter
    if (businessUnitFilter !== "all") {
      result = result.filter(
        (team) => team.businessunitid?.businessunitid === businessUnitFilter
      );
    }

    // Apply text filter
    if (textFilter) {
      const searchTerm = textFilter.toLowerCase();
      result = result.filter((team) => {
        return (
          team.name?.toLowerCase().includes(searchTerm) ||
          team.businessunitid?.name?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return result;
  }, [teams, textFilter, businessUnitFilter]);

  const getSelectedEntityName = useCallback((): string => {
    if (!selectedId) return "";

    if (entityType === "systemuser") {
      const user = systemUsers.find((u) => u.systemuserid === selectedId);
      return user?.fullname ?? "";
    } else {
      const team = teams.find((t) => t.teamid === selectedId);
      return team?.name ?? "";
    }
  }, [selectedId, entityType, systemUsers, teams]);

  const exportToCSV = useCallback(async () => {
    setIsExportingCSV(true);
    try {
      // First, collect all user data with their roles, teams, and queues
      const userData: Array<{
        user: SystemUser;
        roles: SecurityRole[];
        teams: Team[];
        queues: Queue[];
      }> = [];

      for (const user of filteredSystemUsers) {
        const roles = await loadSecurityRolesForUser(user.systemuserid);
        const teams = await loadTeamsForUser(user.systemuserid);
        const queues = await loadQueuesForUser(user.systemuserid);
        userData.push({ user, roles, teams, queues });
      }

      // Collect all unique roles, teams, and queues
      const allRolesMap = new Map<string, string>();
      const allTeamsMap = new Map<string, string>();
      const allQueuesMap = new Map<string, string>();

      userData.forEach(({ roles, teams, queues }) => {
        roles.forEach((role) => allRolesMap.set(role.roleid, role.name));
        teams.forEach((team) => allTeamsMap.set(team.teamid, team.name));
        queues.forEach((queue) => allQueuesMap.set(queue.queueid, queue.name));
      });

      const allRoles = Array.from(allRolesMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );
      const allTeams = Array.from(allTeamsMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );
      const allQueues = Array.from(allQueuesMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );

      // Build CSV header
      const csvLines: string[] = [];
      const headerParts = [
        "User Name",
        "Domain Name",
        "Business Unit",
        "Status",
      ];
      allRoles.forEach(([, name]) => headerParts.push(`Role: ${name}`));
      allTeams.forEach(([, name]) => headerParts.push(`Team: ${name}`));
      allQueues.forEach(([, name]) => headerParts.push(`Queue: ${name}`));
      csvLines.push(headerParts.map((h) => `"${h}"`).join(","));

      // Build data rows
      userData.forEach(({ user, roles, teams, queues }) => {
        const rowParts: string[] = [
          user.fullname,
          user.domainname,
          user.businessunitid?.name ?? "N/A",
          user.isdisabled ? "Disabled" : "Enabled",
        ];

        // Check each role
        allRoles.forEach(([roleId]) => {
          const hasRole = roles.some((r) => r.roleid === roleId);
          rowParts.push(hasRole ? "X" : "");
        });

        // Check each team
        allTeams.forEach(([teamId]) => {
          const hasTeam = teams.some((t) => t.teamid === teamId);
          rowParts.push(hasTeam ? "X" : "");
        });

        // Check each queue
        allQueues.forEach(([queueId]) => {
          const hasQueue = queues.some((q) => q.queueid === queueId);
          rowParts.push(hasQueue ? "X" : "");
        });

        csvLines.push(rowParts.map((p) => `"${p}"`).join(","));
      });

      const csvContent = "\uFEFF" + csvLines.join("\r\n");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await window.toolboxAPI.utils.saveFile(
        `user-security-export-${timestamp}.csv`,
        csvContent
      );
      await window.toolboxAPI.utils.showNotification({
        title: "Export Successful",
        body: "User security data has been exported to CSV successfully.",
        type: "success",
      });
      logger.info("Exported data to CSV successfully");
    } catch (error) {
      logger.error(`Error exporting to CSV: ${(error as Error).message}`);
    } finally {
      setIsExportingCSV(false);
    }
  }, [filteredSystemUsers]);

  const exportToMarkdown = useCallback(async () => {
    setIsExportingMarkdown(true);
    try {
      const mdLines: string[] = [];
      mdLines.push("# User Security Report");
      mdLines.push("");
      mdLines.push(`Generated: ${new Date().toLocaleString()}`);
      mdLines.push("");

      for (const user of filteredSystemUsers) {
        const roles = await loadSecurityRolesForUser(user.systemuserid);
        const teams = await loadTeamsForUser(user.systemuserid);
        const queues = await loadQueuesForUser(user.systemuserid);

        mdLines.push("");
        mdLines.push(`## ${user.fullname}`);
        mdLines.push("");
        mdLines.push(`- **Domain Name:** ${user.domainname}`);
        mdLines.push(
          `- **Business Unit:** ${user.businessunitid?.name ?? "N/A"}`
        );
        mdLines.push(
          `- **Status:** ${user.isdisabled ? "Disabled" : "Enabled"}`
        );

        if (roles.length > 0) {
          mdLines.push("");
          mdLines.push("### Security Roles");
          mdLines.push("");
          roles.forEach((role) => {
            mdLines.push(
              `- ${role.name}${role.ismanaged ? " (Managed)" : ""}${
                role.businessunitid ? ` - ${role.businessunitid.name}` : ""
              }`
            );
          });
        } else {
          mdLines.push("");
          mdLines.push("*No security roles assigned*");
        }

        if (teams.length > 0) {
          mdLines.push("");
          mdLines.push("### Team Memberships");
          mdLines.push("");
          teams.forEach((team) => {
            const teamType =
              team.teamtype === 0
                ? "Owner"
                : team.teamtype === 1
                ? "Access"
                : "Other";
            mdLines.push(
              `- ${team.name} (${teamType})${
                team.isdefault ? " [Default]" : ""
              }${team.businessunitid ? ` - ${team.businessunitid.name}` : ""}`
            );
          });
        } else {
          mdLines.push("");
          mdLines.push("*No team memberships*");
        }

        if (queues.length > 0) {
          mdLines.push("");
          mdLines.push("### Queue Memberships");
          mdLines.push("");
          queues.forEach((queue) => {
            const queueType =
              queue.queuetypecode === 1
                ? "Private"
                : queue.queuetypecode === 2
                ? "Public"
                : "Unknown";
            mdLines.push(`- ${queue.name} (${queueType})`);
          });
        } else {
          mdLines.push("");
          mdLines.push("*No queue memberships*");
        }
      }

      const mdContent = mdLines.join("\n");
      await window.toolboxAPI.utils.copyToClipboard(mdContent);
      await window.toolboxAPI.utils.showNotification({
        title: "Copy Successful",
        body: "User security data has been copied to clipboard as Markdown successfully.",
        type: "success",
      });
      logger.info("Copied data to clipboard as Markdown successfully");
    } catch (error) {
      logger.error(`Error exporting to Markdown: ${(error as Error).message}`);
    } finally {
      setIsExportingMarkdown(false);
    }
  }, [filteredSystemUsers]);

  const exportTeamsToCSV = useCallback(async () => {
    setIsExportingCSV(true);
    try {
      // First, collect all team data with their roles and members
      const teamData: Array<{
        team: Team;
        roles: SecurityRole[];
        members: SystemUser[];
      }> = [];

      for (const team of filteredTeams) {
        const roles = await loadSecurityRolesForTeam(team.teamid);
        const members = await loadUsersForTeam(team.teamid);
        teamData.push({ team, roles, members });
      }

      // Collect all unique roles and members
      const allRolesMap = new Map<string, string>();
      const allMembersMap = new Map<string, string>();

      teamData.forEach(({ roles, members }) => {
        roles.forEach((role) => allRolesMap.set(role.roleid, role.name));
        members.forEach((member) =>
          allMembersMap.set(member.systemuserid, member.fullname)
        );
      });

      const allRoles = Array.from(allRolesMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );
      const allMembers = Array.from(allMembersMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );

      // Build CSV header
      const csvLines: string[] = [];
      const headerParts = ["Team Name", "Team Type", "Business Unit"];
      allRoles.forEach(([, name]) => headerParts.push(`Role: ${name}`));
      allMembers.forEach(([, name]) => headerParts.push(`Member: ${name}`));
      csvLines.push(headerParts.map((h) => `"${h}"`).join(","));

      // Build data rows
      teamData.forEach(({ team, roles, members }) => {
        const teamType =
          team.teamtype === 0
            ? "Owner"
            : team.teamtype === 1
            ? "Access"
            : "Other";
        const rowParts: string[] = [
          team.name,
          teamType,
          team.businessunitid?.name ?? "N/A",
        ];

        // Check each role
        allRoles.forEach(([roleId]) => {
          const hasRole = roles.some((r) => r.roleid === roleId);
          rowParts.push(hasRole ? "X" : "");
        });

        // Check each member
        allMembers.forEach(([memberId]) => {
          const hasMember = members.some((m) => m.systemuserid === memberId);
          rowParts.push(hasMember ? "X" : "");
        });

        csvLines.push(rowParts.map((p) => `"${p}"`).join(","));
      });

      const csvContent = "\uFEFF" + csvLines.join("\r\n");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await window.toolboxAPI.utils.saveFile(
        `team-security-export-${timestamp}.csv`,
        csvContent
      );
      await window.toolboxAPI.utils.showNotification({
        title: "Export Successful",
        body: "Team security data has been exported to CSV successfully.",
        type: "success",
      });
      logger.info("Exported team data to CSV successfully");
    } catch (error) {
      logger.error(`Error exporting to CSV: ${(error as Error).message}`);
    } finally {
      setIsExportingCSV(false);
    }
  }, [filteredTeams]);

  const exportTeamsToMarkdown = useCallback(async () => {
    setIsExportingMarkdown(true);
    try {
      const mdLines: string[] = [];
      mdLines.push("# Team Security Report");
      mdLines.push("");
      mdLines.push(`Generated: ${new Date().toLocaleString()}`);
      mdLines.push("");

      for (const team of filteredTeams) {
        const roles = await loadSecurityRolesForTeam(team.teamid);
        const members = await loadUsersForTeam(team.teamid);

        mdLines.push("");
        mdLines.push(`## ${team.name}`);
        mdLines.push("");
        const teamType =
          team.teamtype === 0
            ? "Owner"
            : team.teamtype === 1
            ? "Access"
            : "Other";
        mdLines.push(`- **Team Type:** ${teamType}`);
        mdLines.push(
          `- **Business Unit:** ${team.businessunitid?.name ?? "N/A"}`
        );
        mdLines.push(`- **Default Team:** ${team.isdefault ? "Yes" : "No"}`);

        if (roles.length > 0) {
          mdLines.push("");
          mdLines.push("### Security Roles");
          mdLines.push("");
          roles.forEach((role) => {
            mdLines.push(
              `- ${role.name}${role.ismanaged ? " (Managed)" : ""}${
                role.businessunitid ? ` - ${role.businessunitid.name}` : ""
              }`
            );
          });
        } else {
          mdLines.push("");
          mdLines.push("*No security roles assigned*");
        }

        if (members.length > 0) {
          mdLines.push("");
          mdLines.push("### Team Members");
          mdLines.push("");
          members
            .sort((a, b) => a.fullname.localeCompare(b.fullname))
            .forEach((member) => {
              mdLines.push(
                `- ${member.fullname} (${member.domainname})${
                  member.isdisabled ? " [Disabled]" : ""
                }${
                  member.businessunitid
                    ? ` - ${member.businessunitid.name}`
                    : ""
                }`
              );
            });
        } else {
          mdLines.push("");
          mdLines.push("*No team members*");
        }
      }

      const mdContent = mdLines.join("\n");
      await window.toolboxAPI.utils.copyToClipboard(mdContent);
      await window.toolboxAPI.utils.showNotification({
        title: "Copy Successful",
        body: "Team security data has been copied to clipboard as Markdown successfully.",
        type: "success",
      });
      logger.info("Copied team data to clipboard as Markdown successfully");
    } catch (error) {
      logger.error(`Error exporting to Markdown: ${(error as Error).message}`);
    } finally {
      setIsExportingMarkdown(false);
    }
  }, [filteredTeams]);

  return (
    <div className={styles.overviewRoot}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Spinner label="Loading data..." size="large" />
        </div>
      ) : (
        <>
          <div className={styles.filterSection}>
            <Filter
              entityType={entityType}
              systemUsers={systemUsers}
              teams={teams}
              statusFilter={statusFilter}
              userTypeFilter={userTypeFilter}
              businessUnitFilter={businessUnitFilter}
              textFilter={textFilter}
              onEntityTypeChanged={(type: "systemuser" | "team") => {
                logger.info(`Entity type changed to: ${type}`);
                setEntityType(type);
                setTextFilter("");
                setStatusFilter("enabled");
                setUserTypeFilter("all");
                setBusinessUnitFilter("all");
                setSelectedId(null);
                setSecurityRoles([]);
                setUserTeams([]);
              }}
              onTextFilterChanged={(searchText: string) => {
                setTextFilter(searchText);
              }}
              onStatusFilterChanged={(
                status: "all" | "enabled" | "disabled"
              ) => {
                logger.info(`Status filter changed to: ${status}`);
                setStatusFilter(status);
              }}
              onUserTypeFilterChanged={(
                userType: "all" | "users" | "applications"
              ) => {
                logger.info(`User type filter changed to: ${userType}`);
                setUserTypeFilter(userType);
              }}
              onBusinessUnitFilterChanged={(businessUnitId: string) => {
                logger.info(
                  `Business unit filter changed to: ${businessUnitId}`
                );
                setBusinessUnitFilter(businessUnitId);
              }}
            />
            {entityType === "systemuser" && (
              <div className={styles.buttonContainer}>
                <Button
                  appearance="primary"
                  icon={
                    isExportingCSV ? <Spinner size="tiny" /> : <SaveRegular />
                  }
                  onClick={exportToCSV}
                  disabled={
                    isExportingCSV ||
                    isExportingMarkdown ||
                    filteredSystemUsers.length === 0
                  }
                >
                  {isExportingCSV ? "Exporting..." : "Export to CSV"}
                </Button>
                <Button
                  appearance="secondary"
                  icon={
                    isExportingMarkdown ? (
                      <Spinner size="tiny" />
                    ) : (
                      <DocumentCopyRegular />
                    )
                  }
                  onClick={exportToMarkdown}
                  disabled={
                    isExportingCSV ||
                    isExportingMarkdown ||
                    filteredSystemUsers.length === 0
                  }
                >
                  {isExportingMarkdown ? "Copying..." : "Copy as Markdown"}
                </Button>
              </div>
            )}
            {entityType === "team" && (
              <div className={styles.buttonContainer}>
                <Button
                  appearance="primary"
                  icon={
                    isExportingCSV ? <Spinner size="tiny" /> : <SaveRegular />
                  }
                  onClick={exportTeamsToCSV}
                  disabled={
                    isExportingCSV ||
                    isExportingMarkdown ||
                    filteredTeams.length === 0
                  }
                >
                  {isExportingCSV ? "Exporting..." : "Export to CSV"}
                </Button>
                <Button
                  appearance="secondary"
                  icon={
                    isExportingMarkdown ? (
                      <Spinner size="tiny" />
                    ) : (
                      <DocumentCopyRegular />
                    )
                  }
                  onClick={exportTeamsToMarkdown}
                  disabled={
                    isExportingCSV ||
                    isExportingMarkdown ||
                    filteredTeams.length === 0
                  }
                >
                  {isExportingMarkdown ? "Copying..." : "Copy as Markdown"}
                </Button>
              </div>
            )}
          </div>

          <div className={styles.dataSection}>
            <div className={styles.gridSection}>
              {entityType === "systemuser" &&
                filteredSystemUsers.length === 0 && (
                  <Text>No system users found.</Text>
                )}
              {entityType === "team" && filteredTeams.length === 0 && (
                <Text>No teams found.</Text>
              )}
              {((entityType === "systemuser" &&
                filteredSystemUsers.length > 0) ||
                (entityType === "team" && filteredTeams.length > 0)) && (
                <DataGridView
                  entityType={entityType}
                  systemUsers={filteredSystemUsers}
                  teams={filteredTeams}
                  selectedId={selectedId}
                  onSelectionChange={handleSelectionChange}
                />
              )}
            </div>
            {selectedId && (
              <SecurityRolesPanel
                entityType={entityType}
                entityName={getSelectedEntityName()}
                roles={securityRoles}
                isLoadingRoles={isLoadingRoles}
                userTeams={userTeams}
                isLoadingTeams={isLoadingTeams}
                userQueues={userQueues}
                isLoadingQueues={isLoadingQueues}
                teamMembers={teamMembers}
                isLoadingTeamMembers={isLoadingTeamMembers}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
