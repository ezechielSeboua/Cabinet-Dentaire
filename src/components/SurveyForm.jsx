import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { sendSurvey } from "../services/cdiService";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/solid";

const RadioGroup = ({ name, options, selectedValue, onChange, required }) => (
  <div className="flex flex-wrap items-center gap-3">
    {options.map((option) => (
      <label
        key={option.value}
        className={`
          cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold
          transition-all duration-200 ease-in-out
          ${
            selectedValue === option.value
              ? "bg-primary-700 text-white border-primary-700 shadow-sm"
              : "bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-gray-600"
          }
        `}
      >
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={selectedValue === option.value}
          onChange={onChange}
          required={required}
          className="sr-only"
        />
        <span>{option.label}</span>
      </label>
    ))}
  </div>
);

const Stepper = ({ steps, currentStep }) => (
  <nav aria-label="Progress" className="mb-12">
    <ol role="list" className="flex items-center">
      {steps.map((step, stepIdx) => (
        <li
          key={step.name}
          className={`relative ${stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""}`}
        >
          {currentStep > step.id ? (
            <>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="h-0.5 w-full bg-primary-600" />
              </div>
              <span className="relative flex h-8 w-8 items-center justify-center bg-primary-600 rounded-full hover:bg-primary-700">
                <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="absolute -bottom-7 w-max text-center text-xs text-slate-600 dark:text-slate-400 font-semibold">
                {step.name}
              </span>
            </>
          ) : currentStep === step.id ? (
            <>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-600" />
              </div>
              <span
                className="relative flex h-8 w-8 items-center justify-center bg-white dark:bg-gray-800 border-2 border-primary-600 rounded-full"
                aria-current="step"
              >
                <span className="h-2.5 w-2.5 bg-primary-600 rounded-full" />
              </span>
              <span className="absolute -bottom-7 w-max text-center text-xs text-primary-600 font-bold">
                {step.name}
              </span>
            </>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="h-0.5 w-full bg-slate-200 dark:bg-slate-600" />
              </div>
              <span className="group relative flex h-8 w-8 items-center justify-center bg-white dark:bg-gray-800 border-2 border-slate-300 dark:border-slate-600 rounded-full hover:border-slate-400">
                <span className="h-2.5 w-2.5 bg-transparent rounded-full" />
              </span>
              <span className="absolute -bottom-7 w-max text-center text-xs text-slate-400 dark:text-slate-500">
                {step.name}
              </span>
            </>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const initialFormData = {
  fullName: "",
  telephoneNumber: "",
  email: "",
  waitingTime: "",
  satisfactionRating: "",
  confortRating: "",
  referalRating: "",
  feedback: "",
};

const surveySteps = [
  { id: 1, name: "Vos informations" },
  { id: 2, name: "Votre expérience" },
  { id: 3, name: "Suggestions" },
];
const totalSteps = surveySteps.length;

const SurveyForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => {
      setFormData(initialFormData);
      setSubmitted(false);
      setCurrentStep(1);
    }, 10000);
    return () => clearTimeout(timer);
  }, [submitted]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setCurrentStep((p) => Math.min(p + 1, totalSteps));
  const handleBack = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const isStepInvalid = () => {
    if (currentStep === 1) return !formData.fullName;
    if (currentStep === 2)
      return (
        !formData.waitingTime ||
        !formData.satisfactionRating ||
        !formData.confortRating ||
        !formData.referalRating
      );
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await sendSurvey(formData);
      setSubmitted(true);
      toast.success("Merci pour votre retour !", { position: "top-center" });
    } catch (error) {
      let msg = "Une erreur est survenue. Veuillez réessayer.";
      if (error.response?.status === 504) {
        msg = "Le serveur a mis trop de temps à répondre. Veuillez réessayer plus tard.";
      } else if (error.response?.status === 400) {
        msg = error.response.data?.message || "Les données envoyées sont incorrectes.";
      } else if (error.request) {
        msg = "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center p-8 md:p-12 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg mx-auto">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">Merci !</h2>
        <p className="text-slate-600 dark:text-slate-300 text-lg">
          Votre avis a été reçu et nous vous en remercions. Votre contribution
          est essentielle pour nous aider à nous améliorer.
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-4 animate-pulse">
          Ce formulaire se réinitialisera automatiquement…
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl">
        <div className="text-center mb-10">
          <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Enquête de satisfaction
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Votre avis est précieux ! Aidez-nous à nous améliorer. Prenez un
            instant pour remplir cette enquête. C'est rapide, facile et anonyme.
          </p>
        </div>

        <Stepper steps={surveySteps} currentStep={currentStep} />

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2">
                Vos informations
              </h2>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder=" "
                  className="w-full px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 peer transition"
                />
                <label
                  htmlFor="fullName"
                  className="absolute left-4 top-3 text-slate-500 dark:text-slate-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:text-sm peer-focus:-top-2.5 peer-focus:px-1 peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:text-primary-600 [&:not(:placeholder-shown)]:text-sm [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:px-1 [&:not(:placeholder-shown)]:bg-white dark:[&:not(:placeholder-shown)]:bg-gray-700"
                >
                  Nom et Prénom
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="w-full px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 peer transition"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-4 top-3 text-slate-500 dark:text-slate-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:text-sm peer-focus:-top-2.5 peer-focus:px-1 peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:text-primary-600 [&:not(:placeholder-shown)]:text-sm [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:px-1 [&:not(:placeholder-shown)]:bg-white dark:[&:not(:placeholder-shown)]:bg-gray-700"
                  >
                    Adresse Email (Optionnel)
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    id="telephoneNumber"
                    name="telephoneNumber"
                    value={formData.telephoneNumber}
                    onChange={handleInputChange}
                    placeholder=" "
                    className="w-full px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 peer transition"
                  />
                  <label
                    htmlFor="telephoneNumber"
                    className="absolute left-4 top-3 text-slate-500 dark:text-slate-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:text-sm peer-focus:-top-2.5 peer-focus:px-1 peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:text-primary-600 [&:not(:placeholder-shown)]:text-sm [&:not(:placeholder-shown)]:-top-2.5 [&:not(:placeholder-shown)]:px-1 [&:not(:placeholder-shown)]:bg-white dark:[&:not(:placeholder-shown)]:bg-gray-700"
                  >
                    Téléphone (Optionnel)
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2">
                Votre expérience
              </h2>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Comment évaluez-vous le temps d'attente ?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <RadioGroup
                  name="waitingTime"
                  selectedValue={formData.waitingTime}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: "Très rapide", label: "Très rapide" },
                    { value: "Rapide", label: "Rapide" },
                    { value: "Acceptable", label: "Acceptable" },
                    { value: "Lent", label: "Lent" },
                  ]}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quel est votre niveau de satisfaction générale ?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <RadioGroup
                  name="satisfactionRating"
                  selectedValue={formData.satisfactionRating}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: "Très satisfait", label: "Très satisfait" },
                    { value: "Satisfait", label: "Satisfait" },
                    { value: "Peu satisfait", label: "Peu satisfait" },
                    { value: "Insatisfait", label: "Insatisfait" },
                  ]}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Comment évaluez-vous le confort de nos locaux ?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <RadioGroup
                  name="confortRating"
                  selectedValue={formData.confortRating}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: "Excellent", label: "Excellent" },
                    { value: "Bon", label: "Bon" },
                    { value: "Moyen", label: "Moyen" },
                    { value: "Médiocre", label: "Médiocre" },
                  ]}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Recommanderiez-vous nos services à votre entourage ?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <RadioGroup
                  name="referalRating"
                  selectedValue={formData.referalRating}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: "Oui, certainement", label: "Oui, certainement" },
                    { value: "Probablement", label: "Probablement" },
                    { value: "Peut-être pas", label: "Peut-être pas" },
                    { value: "Non", label: "Non" },
                  ]}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in space-y-8">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 pb-2">
                Dernières remarques
              </h2>
              <div>
                <label
                  htmlFor="feedback"
                  className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Avez-vous des suggestions pour nous améliorer ? (Optionnel)
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-gray-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Vos idées sont les bienvenues…"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-gray-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Précédent
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isStepInvalid()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                Suivant
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckIcon className="w-5 h-5" />
                )}
                {submitting ? "Envoi…" : "J'envoie mon avis"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyForm;
