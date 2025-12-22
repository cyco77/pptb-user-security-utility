export type SecurityRole = {
  roleid: string;
  name: string;
  businessunitid?: {
    businessunitid: string;
    name: string;
  };
  ismanaged: boolean;
};
