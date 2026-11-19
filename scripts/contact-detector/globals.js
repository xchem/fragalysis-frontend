// The computational model needs registries during module initialization, but
// never creates a viewer or requests atom/bond display data.
export const Debug = false;
export const Log = console;
export const ParserRegistry = { add() {} };
export const DecompressorRegistry = { get() {} };
export const ColormakerRegistry = {
  getScheme() {
    throw new Error('Contact detection does not provide atom rendering');
  }
};
