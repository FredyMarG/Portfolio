<?php

declare(strict_types=1);

namespace App\Core;

/**
 * ============================================================================
 * EXPORTADOR DE REPORTES (app/Core/ReportExporter.php)
 * ============================================================================
 * Genera reportes descargables en Excel (SpreadsheetML .xls) y PDF (PDF 1.4
 * nativo en PHP sin dependencias externas), con soporte para caracteres en
 * español (UTF-8 / Windows-1252) y paginación automática.
 * ============================================================================
 */
class ReportExporter
{
    /**
     * Genera y envía un archivo Excel (.xls) en formato SpreadsheetML XML.
     *
     * @param string   $filename   Nombre base del archivo (sin extensión).
     * @param string   $sheetTitle Nombre de la hoja en Excel.
     * @param string[] $headers    Encabezados de columna.
     * @param array[]  $rows       Filas de datos (valores escalares).
     */
    public static function toExcel(string $filename, string $sheetTitle, array $headers, array $rows): never
    {
        $safeSheet = self::xmlEscape(mb_substr($sheetTitle, 0, 31));

        header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
        header('Content-Disposition: attachment; filename="' . $filename . '.xls"');
        header('Cache-Control: max-age=0');

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<?mso-application progid="Excel.Sheet"?>' . "\n";
        echo '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"' . "\n";
        echo ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' . "\n";
        echo ' <Styles>' . "\n";
        echo '  <Style ss:ID="Header">' . "\n";
        echo '   <Font ss:Bold="1" ss:Color="#FFFFFF"/>' . "\n";
        echo '   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>' . "\n";
        echo '   <Alignment ss:Vertical="Center"/>' . "\n";
        echo '  </Style>' . "\n";
        echo '  <Style ss:ID="Cell">' . "\n";
        echo '   <Alignment ss:Vertical="Center"/>' . "\n";
        echo '  </Style>' . "\n";
        echo ' </Styles>' . "\n";
        echo ' <Worksheet ss:Name="' . $safeSheet . '">' . "\n";
        echo '  <Table>' . "\n";

        echo '   <Row>' . "\n";
        foreach ($headers as $h) {
            echo '    <Cell ss:StyleID="Header"><Data ss:Type="String">' . self::xmlEscape((string)$h) . '</Data></Cell>' . "\n";
        }
        echo '   </Row>' . "\n";

        foreach ($rows as $row) {
            echo '   <Row>' . "\n";
            foreach ($row as $val) {
                if (is_int($val) || is_float($val)) {
                    echo '    <Cell ss:StyleID="Cell"><Data ss:Type="Number">' . $val . '</Data></Cell>' . "\n";
                } else {
                    echo '    <Cell ss:StyleID="Cell"><Data ss:Type="String">' . self::xmlEscape((string)$val) . '</Data></Cell>' . "\n";
                }
            }
            echo '   </Row>' . "\n";
        }

        echo '  </Table>' . "\n";
        echo ' </Worksheet>' . "\n";
        echo '</Workbook>';
        exit;
    }

    /**
     * Genera y envía un documento PDF 1.4 horizontal (A4 Landscape) con tabla paginada.
     *
     * @param string   $filename  Nombre base del archivo (sin extensión).
     * @param string   $title     Título principal del reporte.
     * @param string   $subtitle  Subtítulo o detalle de filtros aplicados.
     * @param string[] $headers   Encabezados de columna.
     * @param array[]  $rows      Filas de datos.
     * @param float[]  $colWidths Anchos de columna en puntos (suma recomendada ~770 pt).
     */
    public static function toPdf(
        string $filename,
        string $title,
        string $subtitle,
        array $headers,
        array $rows,
        array $colWidths
    ): never {
        $pageW = 841.89;
        $pageH = 595.28;
        $marginX = 36.0;
        $bottomLimit = 44.0;
        $rowH = 18.0;
        $headerH = 22.0;

        $pages = [];
        $currentStream = '';
        $y = 0.0;

        $startPage = function (bool $isFirst) use (&$currentStream, &$y, $pageW, $pageH, $marginX, $title, $subtitle, $headers, $colWidths, $headerH): void {
            $currentStream = '';
            // Encabezado del reporte
            $currentStream .= "0.118 0.161 0.231 rg\n";
            $currentStream .= sprintf("%.2F %.2F %.2F %.2F re f\n", $marginX, $pageH - 68, $pageW - 2 * $marginX, 38);

            $currentStream .= "1 1 1 rg\n";
            $currentStream .= self::pdfText($marginX + 12, $pageH - 47, 13, $title, true);
            $meta = ($isFirst ? $subtitle : $title . ' (continuación)') . '  |  Generado: ' . date('d/m/Y H:i');
            $currentStream .= self::pdfText($marginX + 12, $pageH - 61, 8.5, $meta, false);

            $y = $pageH - 86.0;

            // Cabecera de tabla
            $tableW = array_sum($colWidths);
            $currentStream .= "0.200 0.255 0.333 rg\n";
            $currentStream .= sprintf("%.2F %.2F %.2F %.2F re f\n", $marginX, $y - $headerH, $tableW, $headerH);

            $currentStream .= "1 1 1 rg\n";
            $x = $marginX;
            foreach ($headers as $i => $h) {
                $w = $colWidths[$i] ?? 80.0;
                $currentStream .= self::pdfText($x + 5, $y - 14.5, 8.5, self::fitText((string)$h, $w - 8, 8.5), true);
                $x += $w;
            }
            $y -= $headerH;
        };

        $startPage(true);

        if (empty($rows)) {
            $currentStream .= "0.35 0.35 0.35 rg\n";
            $currentStream .= self::pdfText($marginX + 8, $y - 18, 9.5, 'No se encontraron registros para los filtros seleccionados.', false);
            $pages[] = $currentStream;
        } else {
            $tableW = array_sum($colWidths);
            foreach ($rows as $idx => $row) {
                if ($y - $rowH < $bottomLimit) {
                    $pages[] = $currentStream;
                    $startPage(false);
                }

                if ($idx % 2 === 1) {
                    $currentStream .= "0.965 0.973 0.984 rg\n";
                    $currentStream .= sprintf("%.2F %.2F %.2F %.2F re f\n", $marginX, $y - $rowH, $tableW, $rowH);
                }

                // Línea divisoria sutil
                $currentStream .= "0.88 0.90 0.93 RG 0.4 w\n";
                $currentStream .= sprintf("%.2F %.2F m %.2F %.2F l S\n", $marginX, $y - $rowH, $marginX + $tableW, $y - $rowH);

                $currentStream .= "0.10 0.12 0.16 rg\n";
                $x = $marginX;
                foreach ($row as $i => $val) {
                    $w = $colWidths[$i] ?? 80.0;
                    $currentStream .= self::pdfText($x + 5, $y - 12.5, 8.2, self::fitText((string)$val, $w - 8, 8.2), false);
                    $x += $w;
                }
                $y -= $rowH;
            }
            $pages[] = $currentStream;
        }

        // Agregar pie de página con número de página a cada hoja
        $empresaNombre = \App\Models\Configuracion::get()['nombre_empresa'] ?? 'StockFlow Pro';
        $totalPages = count($pages);
        foreach ($pages as $pIdx => &$stream) {
            $stream .= "0.45 0.48 0.54 rg\n";
            $footer = sprintf('%s — Página %d de %d', $empresaNombre, $pIdx + 1, $totalPages);
            $stream .= self::pdfText($marginX, 22.0, 8.0, $footer, false);
        }
        unset($stream);

        $pdf = self::buildPdfDocument($pages, $pageW, $pageH);

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="' . $filename . '.pdf"');
        header('Content-Length: ' . strlen($pdf));
        header('Cache-Control: max-age=0');
        echo $pdf;
        exit;
    }

    /**
     * Escapa caracteres especiales para XML de Excel SpreadsheetML.
     */
    private static function xmlEscape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    /**
     * Convierte texto UTF-8 a Windows-1252 (WinAnsiEncoding) para fuentes Type1 en PDF.
     */
    private static function toWin1252(string $text): string
    {
        $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $text);
        return $converted !== false ? $converted : $text;
    }

    /**
     * Recorta el texto para que quepa dentro del ancho de columna en puntos.
     */
    private static function fitText(string $text, float $maxWidthPt, float $fontSize): string
    {
        $text = preg_replace('/\s+/', ' ', trim($text)) ?? '';
        $avgCharW = $fontSize * 0.50;
        $maxChars = max(3, (int)floor($maxWidthPt / $avgCharW));
        if (mb_strlen($text, 'UTF-8') <= $maxChars) {
            return $text;
        }
        return mb_substr($text, 0, $maxChars - 2, 'UTF-8') . '..';
    }

    /**
     * Genera la instrucción PDF `BT ... ET` para dibujar texto en coordenadas (x, y).
     */
    private static function pdfText(float $x, float $y, float $size, string $text, bool $bold): string
    {
        $font = $bold ? '/F2' : '/F1';
        $encoded = self::toWin1252($text);
        $escaped = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $encoded);
        return sprintf("BT %s %.2F Tf %.2F %.2F Td (%s) Tj ET\n", $font, $size, $x, $y, $escaped);
    }

    /**
     * Ensambla la estructura binaria de objetos PDF 1.4 y su tabla xref.
     *
     * @param string[] $pageStreams
     */
    private static function buildPdfDocument(array $pageStreams, float $pageW, float $pageH): string
    {
        $objects = [];
        $objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
        $objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
        $objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

        $pageRefs = [];
        $nextId = 5;
        foreach ($pageStreams as $stream) {
            $pageId = $nextId++;
            $contentId = $nextId++;
            $pageRefs[] = "{$pageId} 0 R";
            $objects[$pageId] = sprintf(
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.2F %.2F] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents %d 0 R >>",
                $pageW,
                $pageH,
                $contentId
            );
            $objects[$contentId] = "<< /Length " . strlen($stream) . " >>\nstream\n" . $stream . "endstream";
        }

        $objects[2] = "<< /Type /Pages /Kids [" . implode(' ', $pageRefs) . "] /Count " . count($pageRefs) . " >>";
        ksort($objects);

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $id => $body) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$body}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $count = count($objects) + 1;
        $pdf .= "xref\n0 {$count}\n";
        $pdf .= "0000000000 65535 f \n";
        for ($i = 1; $i < $count; $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }

        $pdf .= "trailer\n<< /Size {$count} /Root 1 0 R >>\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF";
        return $pdf;
    }
}
