export interface NodeStyleConfig {
  colors: {
    [key: number]: string;
    default: string;
  };
  sizes: {
    [key: number]: number;
    default: number;
  };
}

export interface SimulationConfig {
  width: number;
  height: number;
}
