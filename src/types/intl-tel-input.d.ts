// intl-tel-input 18.1.6 ships no types; only the two build files the phone field uses.
declare module "intl-tel-input/build/js/data.js" {
  const allCountries: { name: string; iso2: string; dialCode: string; areaCodes: string[] | null }[];
  export default allCountries;
}

declare module "intl-tel-input/build/js/utils.js";

type IntlTelInputUtils = {
  getExampleNumber(iso2: string, national: boolean, numberType: number): string;
  isValidNumber(number: string, iso2: string): boolean;
  getValidationError(number: string, iso2: string): number;
};

interface Window {
  intlTelInputUtils?: IntlTelInputUtils;
}
