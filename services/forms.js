/**
 * Forms Service (Google Forms Alternative)
 */
class FormsService {
  constructor() {
    this.forms = new Map();
    this.responses = new Map();
  }

  async createForm({ title, description, ownerId }) {
    const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const form = {
      id: formId,
      title,
      description,
      ownerId,
      questions: [],
      settings: { collectEmail: true, allowMultiple: false, showProgress: true },
      createdAt: new Date()
    };
    this.forms.set(formId, form);
    return form;
  }

  async addQuestion(formId, question) {
    const form = this.forms.get(formId);
    if (!form) throw new Error('Form not found');
    const newQuestion = { id: `q_${Date.now()}`, ...question };
    form.questions.push(newQuestion);
    return newQuestion;
  }

  async submitResponse(formId, answers) {
    const responseId = `resp_${Date.now()}`;
    const response = { id: responseId, formId, answers, submittedAt: new Date() };
    this.responses.set(responseId, response);
    return response;
  }

  async getResponses(formId) {
    const responses = [];
    this.responses.forEach(resp => {
      if (resp.formId === formId) responses.push(resp);
    });
    return responses;
  }
}
module.exports = new FormsService();
