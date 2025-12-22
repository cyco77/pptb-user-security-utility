import React, { useMemo } from "react";
import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  makeStyles,
  TableColumnDefinition,
  createTableColumn,
  type DataGridProps,
  type OnSelectionChangeData,
} from "@fluentui/react-components";
import { SystemUser } from "../types/systemUser";
import { Team } from "../types/team";

interface IDataGridViewProps {
  entityType: "systemuser" | "team";
  systemUsers: SystemUser[];
  teams: Team[];
  selectedId: string | null;
  onSelectionChange: (id: string | null) => void;
}

const useStyles = makeStyles({
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  dataGrid: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  dataGridBody: {
    overflowY: "auto",
    flex: 1,
  },
  cellStyles: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
});

export const DataGridView: React.FC<IDataGridViewProps> = ({
  entityType,
  systemUsers,
  teams,
  selectedId,
  onSelectionChange,
}) => {
  const styles = useStyles();

  const selectedItems = useMemo(() => {
    return selectedId ? new Set<string>([selectedId]) : new Set<string>();
  }, [selectedId]);

  const handleSelectionChange: DataGridProps["onSelectionChange"] = (
    _e,
    data: OnSelectionChangeData
  ) => {
    const selected = Array.from(data.selectedItems)[0];
    onSelectionChange(selected ? String(selected) : null);
  };

  const systemUserColumns: TableColumnDefinition<SystemUser>[] = [
    createTableColumn<SystemUser>({
      columnId: "fullname",
      compare: (a, b) => a.fullname.localeCompare(b.fullname),
      renderHeaderCell: () => "Full Name",
      renderCell: (item) => (
        <div className={styles.cellStyles}>{item.fullname}</div>
      ),
    }),
    createTableColumn<SystemUser>({
      columnId: "domainname",
      compare: (a, b) => a.domainname.localeCompare(b.domainname),
      renderHeaderCell: () => "Domain Name",
      renderCell: (item) => (
        <div className={styles.cellStyles}>{item.domainname}</div>
      ),
    }),
    createTableColumn<SystemUser>({
      columnId: "businessunit",
      compare: (a, b) =>
        (a.businessunitid?.name ?? "").localeCompare(
          b.businessunitid?.name ?? ""
        ),
      renderHeaderCell: () => "Business Unit",
      renderCell: (item) => (
        <div className={styles.cellStyles}>
          {item.businessunitid?.name ?? "N/A"}
        </div>
      ),
    }),
    createTableColumn<SystemUser>({
      columnId: "status",
      compare: (a, b) =>
        a.isdisabled === b.isdisabled ? 0 : a.isdisabled ? 1 : -1,
      renderHeaderCell: () => "Status",
      renderCell: (item) => (
        <div className={styles.cellStyles}>
          {item.isdisabled ? "Disabled" : "Enabled"}
        </div>
      ),
    }),
  ];

  const teamColumns: TableColumnDefinition<Team>[] = [
    createTableColumn<Team>({
      columnId: "name",
      compare: (a, b) => a.name.localeCompare(b.name),
      renderHeaderCell: () => "Team Name",
      renderCell: (item) => (
        <div className={styles.cellStyles}>{item.name}</div>
      ),
    }),
    createTableColumn<Team>({
      columnId: "teamtype",
      compare: (a, b) => a.teamtype - b.teamtype,
      renderHeaderCell: () => "Team Type",
      renderCell: (item) => (
        <div className={styles.cellStyles}>
          {item.teamtype === 0
            ? "Owner"
            : item.teamtype === 1
            ? "Access"
            : "Other"}
        </div>
      ),
    }),
    createTableColumn<Team>({
      columnId: "businessunit",
      compare: (a, b) =>
        (a.businessunitid?.name ?? "").localeCompare(
          b.businessunitid?.name ?? ""
        ),
      renderHeaderCell: () => "Business Unit",
      renderCell: (item) => (
        <div className={styles.cellStyles}>
          {item.businessunitid?.name ?? "N/A"}
        </div>
      ),
    }),
    createTableColumn<Team>({
      columnId: "isdefault",
      compare: (a, b) =>
        a.isdefault === b.isdefault ? 0 : a.isdefault ? -1 : 1,
      renderHeaderCell: () => "Default Team",
      renderCell: (item) => (
        <div className={styles.cellStyles}>{item.isdefault ? "Yes" : "No"}</div>
      ),
    }),
  ];

  if (entityType === "systemuser") {
    return (
      <div className={styles.container}>
        <DataGrid
          items={systemUsers}
          columns={systemUserColumns}
          sortable
          defaultSortState={{
            sortColumn: "fullname",
            sortDirection: "ascending",
          }}
          className={styles.dataGrid}
          size="small"
          selectionMode="single"
          selectedItems={selectedItems}
          onSelectionChange={handleSelectionChange}
          getRowId={(item) => item.systemuserid}
        >
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => (
                <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
              )}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<SystemUser> className={styles.dataGridBody}>
            {({ item, rowId }) => (
              <DataGridRow<SystemUser> key={rowId}>
                {({ renderCell }) => (
                  <DataGridCell>{renderCell(item)}</DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DataGrid
        items={teams}
        columns={teamColumns}
        sortable
        defaultSortState={{ sortColumn: "name", sortDirection: "ascending" }}
        className={styles.dataGrid}
        size="small"
        selectionMode="single"
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        getRowId={(item) => item.teamid}
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<Team> className={styles.dataGridBody}>
          {({ item, rowId }) => (
            <DataGridRow<Team> key={rowId}>
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
    </div>
  );
};
