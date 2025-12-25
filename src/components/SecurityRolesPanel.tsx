import React, { useState, useMemo } from "react";
import {
  makeStyles,
  tokens,
  Title3,
  Title2,
  Text,
  Spinner,
  Card,
  CardHeader,
  Badge,
  SearchBox,
} from "@fluentui/react-components";
import { SecurityRole } from "../types/securityRole";
import { Team } from "../types/team";
import { SystemUser } from "../types/systemUser";
import { Queue } from "../types/queue";

interface ISecurityRolesPanelProps {
  entityType: "systemuser" | "team";
  entityName: string;
  roles: SecurityRole[];
  isLoadingRoles: boolean;
  userTeams?: Team[];
  isLoadingTeams?: boolean;
  userQueues?: Queue[];
  isLoadingQueues?: boolean;
  teamMembers?: SystemUser[];
  isLoadingTeamMembers?: boolean;
}

const useStyles = makeStyles({
  panel: {
    width: "400px",
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    flexShrink: 0,
  },
  content: {
    padding: tokens.spacingVerticalM,
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: tokens.spacingVerticalXXL,
  },
  emptyState: {
    textAlign: "center",
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
  roleCard: {
    padding: tokens.spacingVerticalM,
  },
  roleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  roleDetails: {
    marginTop: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  sectionTitle: {
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalXS,
  },
  teamCard: {
    padding: tokens.spacingVerticalM,
  },
  teamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  teamDetails: {
    marginTop: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  badge: {
    marginLeft: tokens.spacingHorizontalM,
  },
  userCard: {
    padding: tokens.spacingVerticalM,
  },
  userHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  userDetails: {
    marginTop: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  filterInput: {
    marginBottom: tokens.spacingVerticalS,
  },
  queueCard: {
    padding: tokens.spacingVerticalM,
  },
  queueName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
  },
  queueDetails: {
    marginTop: tokens.spacingVerticalXS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});

export const SecurityRolesPanel: React.FC<ISecurityRolesPanelProps> = ({
  entityType,
  entityName,
  roles,
  isLoadingRoles,
  userTeams = [],
  isLoadingTeams = false,
  userQueues = [],
  isLoadingQueues = false,
  teamMembers = [],
  isLoadingTeamMembers = false,
}) => {
  const styles = useStyles();
  const [memberFilter, setMemberFilter] = useState("");

  const filteredTeamMembers = useMemo(() => {
    if (!memberFilter) return teamMembers;

    const searchTerm = memberFilter.toLowerCase();
    return teamMembers.filter((user) => {
      return (
        user.fullname?.toLowerCase().includes(searchTerm) ||
        user.domainname?.toLowerCase().includes(searchTerm) ||
        user.businessunitid?.name?.toLowerCase().includes(searchTerm)
      );
    });
  }, [teamMembers, memberFilter]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Title2>{entityName}</Title2>
      </div>
      <div className={styles.content}>
        {/* Security Roles Section */}
        <div className={styles.section}>
          <Title3 className={styles.sectionTitle}>Security Roles</Title3>
          {isLoadingRoles ? (
            <div className={styles.loadingContainer}>
              <Spinner label="Loading security roles..." />
            </div>
          ) : roles.length === 0 ? (
            <div className={styles.emptyState}>
              <Text>No security roles assigned</Text>
            </div>
          ) : (
            roles.map((role) => (
              <Card key={role.roleid} className={styles.roleCard}>
                <CardHeader
                  header={
                    <div className={styles.roleHeader}>
                      <div className={styles.roleName}>{role.name}</div>
                      {role.ismanaged && (
                        <Badge
                          appearance="tint"
                          color="informative"
                          className={styles.badge}
                        >
                          Managed
                        </Badge>
                      )}
                    </div>
                  }
                  description={
                    <div className={styles.roleDetails}>
                      {role.businessunitid
                        ? `Business Unit: ${role.businessunitid.name}`
                        : "No Business Unit"}
                    </div>
                  }
                />
              </Card>
            ))
          )}
        </div>

        {/* Teams Section - only for system users */}
        {entityType === "systemuser" && (
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>Team Memberships</Title3>
            {isLoadingTeams ? (
              <div className={styles.loadingContainer}>
                <Spinner label="Loading teams..." />
              </div>
            ) : userTeams.length === 0 ? (
              <div className={styles.emptyState}>
                <Text>No team memberships</Text>
              </div>
            ) : (
              userTeams.map((team) => (
                <Card key={team.teamid} className={styles.teamCard}>
                  <CardHeader
                    header={
                      <div className={styles.teamHeader}>
                        <div className={styles.teamName}>{team.name}</div>
                        {team.isdefault && (
                          <Badge
                            appearance="tint"
                            color="success"
                            className={styles.badge}
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                    }
                    description={
                      <div className={styles.teamDetails}>
                        <div>
                          {team.teamtype === 0
                            ? "Owner Team"
                            : team.teamtype === 1
                            ? "Access Team"
                            : "Other"}
                        </div>
                        {team.businessunitid && (
                          <div>Business Unit: {team.businessunitid.name}</div>
                        )}
                      </div>
                    }
                  />
                </Card>
              ))
            )}
          </div>
        )}

        {/* Queues Section - only for system users */}
        {entityType === "systemuser" && (
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>Queue Memberships</Title3>
            {isLoadingQueues ? (
              <div className={styles.loadingContainer}>
                <Spinner label="Loading queues..." />
              </div>
            ) : userQueues.length === 0 ? (
              <div className={styles.emptyState}>
                <Text>No queue memberships</Text>
              </div>
            ) : (
              userQueues.map((queue) => (
                <Card key={queue.queueid} className={styles.queueCard}>
                  <CardHeader
                    header={
                      <div className={styles.queueName}>{queue.name}</div>
                    }
                    description={
                      <div className={styles.queueDetails}>
                        {queue.queuetypecode !== undefined && (
                          <div>
                            Type:{" "}
                            {queue.queuetypecode === 1
                              ? "Private"
                              : queue.queuetypecode === 2
                              ? "Public"
                              : "Unknown"}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              ))
            )}
          </div>
        )}

        {/* Team Members Section - only for teams */}
        {entityType === "team" && (
          <div className={styles.section}>
            <Title3 className={styles.sectionTitle}>Team Members</Title3>
            {isLoadingTeamMembers ? (
              <div className={styles.loadingContainer}>
                <Spinner label="Loading team members..." />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className={styles.emptyState}>
                <Text>No team members</Text>
              </div>
            ) : (
              <>
                <SearchBox
                  className={styles.filterInput}
                  placeholder="Filter members..."
                  value={memberFilter}
                  onChange={(e, data) => setMemberFilter(data.value)}
                />
                {filteredTeamMembers.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Text>No members match the filter</Text>
                  </div>
                ) : (
                  [...filteredTeamMembers]
                    .sort((a, b) => a.fullname.localeCompare(b.fullname))
                    .map((user) => (
                      <Card key={user.systemuserid} className={styles.userCard}>
                        <CardHeader
                          header={
                            <div className={styles.userHeader}>
                              <div className={styles.userName}>
                                {user.fullname}
                              </div>
                              {user.isdisabled && (
                                <Badge
                                  appearance="tint"
                                  color="warning"
                                  className={styles.badge}
                                >
                                  Disabled
                                </Badge>
                              )}
                            </div>
                          }
                          description={
                            <div className={styles.userDetails}>
                              <div>{user.domainname}</div>
                              {user.businessunitid && (
                                <div>
                                  Business Unit: {user.businessunitid.name}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
