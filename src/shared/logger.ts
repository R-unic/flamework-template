const log = (category: keyof typeof Log, message: string): void =>
  print(`[${category.upper()}]: ${message}`);

namespace Log {
  export function info(message: string): void {
    log("info", message);
  }

  export function warning(message: string): void {
    log("warning", message);
  }
}

export default Log;