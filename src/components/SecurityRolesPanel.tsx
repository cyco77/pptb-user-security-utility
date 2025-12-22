import React from "react";
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
} from "@fluentui/react-components";
import { SecurityRole } from "../types/securityRole";
import { Team } from "../types/team";

interface ISecurityRolesPanelProps {
  entityType: "systemuser" | "team";
  entityName: string;
  roles: SecurityRole[];
  isLoadingRoles: boolean;
  userTeams?: Team[];
  isLoadingTeams?: boolean;
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
});

export const SecurityRolesPanel: React.FC<ISecurityRolesPanelProps> = ({
  entityType,
  entityName,
  roles,
  isLoadingRoles,
  userTeams = [],
  isLoadingTeams = false,
}) => {
  const styles = useStyles();

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
                        <Badge appearance="tint" color="informative">
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
                          <Badge appearance="tint" color="success">
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
      </div>
    </div>
  );
};
