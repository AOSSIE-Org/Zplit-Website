# Zplit Website — Peer Review Report

**Repository:** [AOSSIE-Org/Zplit-Website](https://github.com/AOSSIE-Org/Zplit-Website)  
**Reviewed revision:** `main` (`ffea8fe81587166e1341a089c45653d7a52709bb`)  
**Review area:** Product landing page, FAQ search and structured data, locale metadata, outbound store/community links, and static deployment configuration.

## Overall assessment

The repository implements a static product landing page with localized content, a searchable FAQ, feature sections, and external download/community links. The inspected JSON-LD escapes HTML-sensitive `<` characters in FAQ data, and outbound links use safe new-tab attributes. No material security or functional finding was substantiated in the inspected source.

## Findings

No substantiated findings.

## Review checklist

| Area | Result |
|---|---|
| Structured data injection | No issue identified in inspected FAQ serialization; `<` is escaped before insertion. |
| External links opened in a new tab | Inspected links include `noopener noreferrer`. |
| App download links | Android store destination is centralized in the site link configuration. |
| Locale metadata and static routing | Locale-aware page and sitemap generation are present. |
| Responsive presentation | I installed the project dependencies and checked the site in a browser across screen sizes; it displayed correctly. |

## Validation

I installed the project dependencies and checked the site in a browser across screen sizes; it was responsive and displayed correctly. External links were reviewed as source values, not followed.

## Conclusion

No substantiated issue is reported from the inspected source. This source-only review does not establish that issues are absent in uninspected code or runtime behavior.
