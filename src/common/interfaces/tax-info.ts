export interface TaxInfo {
    geoPostalCode: string;
    geoCity: string;
    geoCounty: string;
    geoState: string;
    taxSales: number;
    taxUse: number;
    txbService: string | null;
    txbFreight: string | null;
    stateSalesTax: number;
    stateUseTax: number;
    citySalesTax: number;
    cityUseTax: number;
    cityTaxCode: string;
    countySalesTax: number;
    countyUseTax: number;
    countyTaxCode: string;
    districtSalesTax: number;
    districtUseTax: number;
    district1Code: string;
    district1SalesTax: number;
    district1UseTax: number;
    district2Code: string;
    district2SalesTax: number;
    district2UseTax: number;
    district3Code: string;
    district3SalesTax: number;
    district3UseTax: number;
    district4Code: string;
    district4SalesTax: number;
    district4UseTax: number;
    district5Code: string;
    district5SalesTax: number;
    district5UseTax: number;
    originDestination: string | null;
}
