import moment from 'moment';
import {
    IsPositive, Min, IsEthereumAddress, MinLength,
    MaxLength, validateOrReject, arrayMinSize,
    ArrayMinSize, ArrayMaxSize, Matches, IsInt, IsIn, IsEnum, IsDate, IsString, ValidateNested, IsOptional
} from 'class-validator';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { RucType, TipoAmbiente, TipoEmision, TipoRuc } from './models';

export class CUFE {
    constructor() {

    }

    @IsInt()
    public iDoc: number;

    @IsEnum(TipoRuc)
    public dTipoRuc: TipoRuc;

    @IsEnum(RucType)
    public dRUC: RucType;


    @IsInt()
    public dDV: number;

    @IsString()
    public dSucEm: string;

    @IsDate()
    public dFechaEm: Date;

    @Matches('^(?=.*[1-9].*)[0-9]{10}$')
    public dNroDF: string;

    /**
     *             B08: Punto de Facturación del documento fiscal. La serie sirve para permitir que existan secuencias independientes de numeración de facturas, con diversas finalidades, sea por libre elección del emisor, tales como puntos de facturación distintos (como cajas de un supermercado, o bodegas de un distribuidor), tipos de productos, especies de operación, etc., sea para finalidades que vengan  a ser determinadas por la DIRECCIÓN GENERAL DE INGRESOS.
     */
    @Matches('^^(?=.*[1-9].*)[0-9]{3}$')
    public dPtoFacDF: string;


    /**
     * Ambientes de destino de la FE
     */
    @IsEnum(TipoAmbiente)
    public iAmb: TipoAmbiente;

    /**
     * Tipo de Emision
     */
    @IsEnum(TipoEmision)
    public iTpEmis: TipoEmision;

    @IsString()
    public dSeg: string;
}


export class CUFEBuilder {
    cufeSequence = ['0'.repeat(64)];
    constructor(
        private cufe: CUFE
    ) {

    }

    async create() {
        // tipo documento
        const tipoDocumento = this.cufe.iDoc.toString().padStart(2, '0');

        // tipo contribuyente
        const tipoContribuyente = this.cufe.dTipoRuc.toString();

        // ruc
        const ruc = this.cufe.dRUC.dRuc;

        // dv
        const dv = this.cufe.dRUC.dDV.padStart(
            this.cufe.dRUC.dDV.length + 1,
            '-'
        );

        // cod sucursal
        const codSucursal = this.cufe.dSucEm.padStart(4, '0');

        // fecha
        const fechaEmision = moment(this.cufe.dFechaEm).format('YYYYMMDD');

        // nro df
        const nrodf = this.cufe.dNroDF.padStart(10, '0');
        
        // ptr fac
        const ptofac = this.cufe.dPtoFacDF.padStart(3, '0');

        const tipoEmis = this.cufe.iTpEmis.padStart(2, '0');

        const dseg = Math.floor(Math.random()*10e9);


    }
}