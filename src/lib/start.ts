import config from '../configuration';

export const setModuleStatus = (modules: any) => {
  const keys: string[] = Object.keys(modules);
  keys.forEach((key: string) => {
    const module: any = modules[key];
    const { moduleName }: { moduleName: string } = module;

    if (!module) {
      return;
    }

    module.dispose();

    if (config[moduleName as keyof typeof config]) {
      module.active();
    } else {
      module.dispose();
    }
  });
};
