declare module "egg" {
  // extend app
  interface Application {
    registerRemote: Function;
    swagger: any;
  }
  // extend your config
  interface EggAppConfig {
    connectorRest: {
      jsonDir?: Function;
      formatModelName?: Function;
      modelFindByPk?: Function;
      getModel?: Function;
      accessControl?: Function;
      wrapScript?: Function;
      swaggerMountPath?: string;
      swaggerDoc: any;
    };
  }
}
