
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    try {
      // Usamos una comprobación segura para entornos que no inyectan 'process'
      const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
      this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
    } catch (e) {
      console.error("No se pudo inicializar Gemini:", e);
    }
  }

  private get model() {
    if (!this.ai) throw new Error("AI no inicializada");
    return this.ai.models;
  }

  async getSectionExplanation(sectionTitle: string, planType: string, businessIdea: string = "una cafetería orgánica") {
    const prompt = `Actúa como un profesor de negocios experto. Explica de forma clara, sencilla y educativa la sección "${sectionTitle}" dentro de un plan de negocios de tipo "${planType}". 
    Usa el siguiente ejemplo de negocio para ilustrar tu explicación: "${businessIdea}".
    
    Formato de respuesta: Markdown con negritas para conceptos clave. Mantén la explicación corta pero sustanciosa (máximo 150 palabras).`;

    try {
      const response = await this.model.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error calling Gemini:", error);
      return "Lo siento, no pude obtener una explicación en este momento.";
    }
  }

  async generateExampleIdea(currentContext: string = "") {
     let prompt = "";
     if (currentContext && currentContext.trim().length > 3) {
       prompt = `Actúa como un consultor de innovación. Tengo esta idea inicial: "${currentContext}". 
       Refínala para que sea disruptiva, escalable y profesional. 
       Devuelve SOLO la frase de la idea mejorada, sin etiquetas adicionales.`;
     } else {
       prompt = "Dame una idea de negocio EdTech o SaaS innovadora centrada en automatización o IA. Solo la frase de la idea.";
     }

     try {
      const response = await this.model.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text.replace(/["']/g, "").trim();
    } catch (error) {
      return "Plataforma de micro-certificaciones con IA para el sector industrial.";
    }
  }

  async fillSingleField(businessIdea: string, fieldName: string, fieldDescription: string) {
    const prompt = `Actúa como un consultor de negocios senior. Basado en la idea de negocio: "${businessIdea}", genera el contenido profesional para el campo "${fieldName}".
    Descripción del campo: ${fieldDescription}.
    
    Por favor, genera un texto persuasivo, profesional y bien estructurado. 
    Respuesta: SOLO el texto generado, sin etiquetas adicionales.`;

    try {
      const response = await this.model.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error("Error filling single field:", error);
      return null;
    }
  }

  async fillEntirePlan(businessIdea: string, planType: string, sections: {id: string, title: string}[]) {
    const prompt = `Actúa como un consultor de negocios senior. Genera un borrador completo para un plan de negocios de tipo ${planType} basado en la idea: "${businessIdea}".
    
    REGLA MANDATORIA PARA LA SECCIÓN "2" (Descripción de la Compañía): 
    Debes devolver un objeto estructurado con estos campos específicos:
    - "adn": Historia, misión, visión y valores.
    - "valor": Núcleo de valor respondiendo: ¿qué? ¿como? ¿cuando? ¿donde? ¿por que? ¿para que?
    - "competencia": Estrategia competitiva, diferenciación y barreras.
    - "mercado": Mercado meta y análisis FODA.
    - "vision2026": Futuro, tecnología e IA.
    - "viabilidad": Equipo y estructura organizativa.
    - "proyecciones": Inversión y proyecciones a 3 años (modelo lineal a pasivo).
    - "valores": Automatización, experiencia, calidad de vida, innovación.
    - "pitch": Speech de venta de 30 segundos.
    - "blindaje": Blindaje legal y propiedad intelectual (IP).
    - "website": Un dominio de ejemplo (ej: www.nombrenegocio.com).
    - "fiscalRegime": Un régimen fiscal adecuado (ej: RESICO, Actividad Empresarial).
    - "schedule": Horario de atención sugerido.

    Para las demás secciones (IDs: ${sections.filter(s => s.id !== '2').map(s => s.id).join(', ')}), genera un párrafo profesional.
    
    Devuelve la respuesta ÚNICAMENTE en formato JSON válido.`;

    try {
      const response = await this.model.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error filling entire plan:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();
