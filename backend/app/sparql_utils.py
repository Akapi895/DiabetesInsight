from rdflib import Graph, Namespace
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ONTOLOGY_PATH = os.path.abspath(os.path.join(CURRENT_DIR, "..", "diabetes.rdf"))
def get_suitable_drugs(patient_id: int) -> list:
    g = Graph()
    g.parse(ONTOLOGY_PATH, format="xml")
    
    DIABETES = Namespace("http://www.semanticweb.org/admin/ontologies/2025/3/diabetes#")
    g.bind("", DIABETES)

    patient_individual = f"Patient{patient_id}"

    query = f"""
    PREFIX : <http://www.semanticweb.org/admin/ontologies/2025/3/diabetes#>

    SELECT ?drug
    WHERE {{
      ?drug a :Glucose-Lowering_Agents .
      FILTER NOT EXISTS {{
        ?drug :has_Disadvantages ?disadvantage .
        :{patient_individual} :has_History_of_Diseases ?disadvantage .
      }}
      FILTER NOT EXISTS {{
        :{patient_individual} :has_Adverse_Drug_Reactions ?drug .
      }}
    }}
    """

    results = g.query(query)

    suitable_drugs = []
    for row in results:
        drug_uri = row.drug
        drug_name = str(drug_uri).split("#")[-1].replace("_", " ")
        suitable_drugs.append(drug_name)

    if len(suitable_drugs) == 0:
        return "Không có thuốc phù hợp"
    return suitable_drugs