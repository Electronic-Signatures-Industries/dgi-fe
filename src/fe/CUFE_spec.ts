import moment from 'moment';
import {
    BlockSchema,
    DIDNodeSchema,
    DocumentNodeSchema,
    EventType,
    LogNodeSchema
} from '../storage';
import { CatBienes } from './models/CatBienes';
import { DescBienes } from './models/DescBienes';
import {
    Destino,
    DGen,
    EntregaCafe,
    EnvioContenedorFE,
    FormaPago,
    FormularioCafe,
    Item,
    RucType,
    TasaITBMS,
    TiempoPago,
    TipoAmbiente,
    TipoDocumento,
    TipoEmision,
    TipoGeneracion,
    TipoNaturalezaOperacion,
    TipoOperacion,
    TipoReceptor,
    TipoRuc,
    TipoTransaccionVenta,
    Totales
} from './models';
import { DIDDocumentBuilder, DIDMethodXDV } from '../did';
import { eddsa } from 'elliptic';
import { expect } from 'chai';
import { FEBuilder, Plantillas } from './FEBuilder';
// import { IpldClient } from '../ipld';
import {
    KeyConvert,
    Wallet,
    X509Info,
    XmlDsig
} from '../crypto';
import { LDCryptoTypes, X509 } from '../crypto';
import { Paises } from './models/Paises';
import { Ubicaciones } from './models/Ubicaciones';

import { Unidades } from './models/Unidades';
import { CUFE, CUFEBuilder } from '../fe/CUFE';
import { copyFile } from 'fs';
// const ipld = new IpldClient();
// const xdvMethod = new DIDMethodXDV(ipld);
const localStorage = {};

const testMatch = `<rFE xmlns="http://dgi-fep.mef.gob.pa"><dVerForm>1.00</dVerForm><dId>FE01200000000000029-29-29-5676322018101525982740639300126729580548</dId><gDGen><iAmb>2</iAmb><iTpEmis>01</iTpEmis><dFechaSalida>2020-10-09T00:00:00-05:00</dFechaSalida><iTipoTranVenta>1</iTipoTranVenta><iDoc>01</iDoc><dNroDF>2598274063</dNroDF><dPtoFacDF>930</dPtoFacDF><dFechaEm>2020-10-09T00:00:00-05:00</dFechaEm><iNatOp>01</iNatOp><iTipoOp>2</iTipoOp><iDest>1</iDest><iFormCAFE>1</iFormCAFE><iEntCafe>3</iEntCafe><dEnvFe>1</dEnvFe><iProGen>1</iProGen><gEmis/><gRucEmi><dDV>56</dDV><dRuc>29-29-29</dRuc><dTipoRuc>2</dTipoRuc></gRucEmi><gUbiEm><dCodUbi>1-1-2<dProv>1</dProv><dDistr>1</dDistr><dCorreg>2</dCorreg></dCodUbi><dNombEm></dNombEm><dCoordEm>+8.9892,-79.5201</dCoordEm><dDirecEm>Calle 50</dDirecEm><gUbiEm><dCodUbi>1-1-2</dCodUbi></gUbiEm><dTfnEm>66731138</dTfnEm></gUbiEm><gDatRec/><gRucRec><dDV>56</dDV><dRuc>29-29-29</dRuc><dTipoRuc>2</dTipoRuc></gRucRec><gUbiRec><dCodUbi>13-1-3<dProv>13</dProv><dDistr>1</dDistr><dCorreg>3</dCorreg></dCodUbi><iTipoRec>01</iTipoRec><cPaisRec>PA</cPaisRec><dDirecRec>Calle 50</dDirecRec><dTfnRec>66731138</dTfnRec></gUbiRec><gAutXML><gRucAutXML><dDV>56</dDV><dRuc>29-29-29</dRuc><dTipoRuc>2</dTipoRuc></gRucAutXML></gAutXML><gItem><cCantCodInt>1</cCantCodInt><dDescProd>Servicios profesionales Abril Mayo 2020 relacionado a desarrollo web</dDescProd><dSecItem>1</dSecItem><gPrecios><dPrItem>500</dPrItem><dPrUnit>500</dPrUnit><dValTotItem>500</dValTotItem><gITBMSItem><dTasaITBMS>00</dTasaITBMS><dValITBMS>0</dValITBMS><dInfEmFE>No reembolsable</dInfEmFE><cUnidad>Actividad</cUnidad></gITBMSItem><gItem><cCantCodInt>1</cCantCodInt><dDescProd>Investigacion de algoritmo para firmar una factura electronica</dDescProd><dSecItem>2</dSecItem><gPrecios><dPrItem>500</dPrItem><dPrUnit>500</dPrUnit><dValTotItem>500</dValTotItem><gITBMSItem><dTasaITBMS>00</dTasaITBMS><dValITBMS>0</dValITBMS><dInfEmFE>Probablemente posible</dInfEmFE><dCodCPBScmp>4323</dCodCPBScmp><dCodCPBSabr>80</dCodCPBSabr></gITBMSItem><gTot><iPzPag>2</iPzPag><dNroItems>1.00</dNroItems><dTotITBMS>0.00</dTotITBMS><dTotNeto>1000.00</dTotNeto><dTotRec>0.00</dTotRec><dTotGravado>1000.00</dTotGravado><dVTot>1000.00</dVTot><dVTotItems>1.00</dVTotItems><dVuelto>0.00</dVuelto></gTot></gPrecios></gItem></gPrecios></gItem></gDGen></rFE>`
describe("FEBuilder", function () {
    let latestFEDocument;
    let feDoocument;
    let feSigned;
    beforeEach(function () {
    });

    it("should be able to create a CUFE", async function () {
        const testMatch = '011000008-PE-3824-00523-280001201707150000015134001011745018343';
        const cufe = new CUFE();
        cufe.iAmb = TipoAmbiente.Produccion;
        cufe.dFechaEm = new Date(2017, 6, 15);
        cufe.iTpEmis = TipoEmision.UsoPrevioOpsNormal.replace('0', '');
        const gRucEmi = {
            dTipoRuc: TipoRuc.Natural,
            dRuc: '000008-PE-3824-00523',
            dDV: '28'
        };

        cufe.iDoc = TipoDocumento.FacturaOpsInterna.replace('0', '');
        cufe.dDV = 28;
        cufe.dSucEm = '0001';
        cufe.dRUC = gRucEmi;
        cufe.dTipoRuc = TipoRuc.Natural;
        cufe.dPtoFacDF = '1';
        cufe.dNroDF = '15134';
        cufe.dSeg = '745018343';
        const cufeBuilder = new CUFEBuilder(cufe);
        const res = cufeBuilder.create('745018343');

        expect(res).equal(testMatch);
        expect(res.length).equal(64);
    });

    xit("should be able to sign with RSA Key pair", async function () {
        const issuer: X509Info = {
            stateOrProvinceName: 'PA',
            organizationName: 'RM',
            organizationalUnitName: 'Engineering',
            commonName: 'Rogelio Morrell',
            countryName: 'Panama',
            localityName: 'Panama'
        };
        const rsaKey = await Wallet.getRSA256Standalone();

        const rsaKeyExports = await KeyConvert.getX509RSA(rsaKey);
        const selfSignedCert = X509.createSelfSignedCertificateFromRSA(
            rsaKeyExports.pemAsPrivate, rsaKeyExports.pemAsPublic, issuer);
        try {
            const signedDocuments = await XmlDsig.signFEDocument(rsaKeyExports.pemAsPrivate, selfSignedCert, latestFEDocument);
            expect(!!signedDocuments.json).equals(true)
            expect(!!signedDocuments.xml).equals(true)
        } catch (e) {
            console.log(e);
        }
    });


});
