"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

interface Village { id: string; name: string; slug: string }
interface Clan { id: string; name: string; slug: string }

interface ContributeFormProps {
  villages: Village[];
  clans: Clan[];
}

type Action = "new_person" | "edit" | "add_relationship";

const STEPS = ["Action", "Person Details", "Relationship", "Source", "Review"];

export function ContributeForm({ villages, clans }: ContributeFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [action, setAction] = useState<Action>("new_person");
  const [personData, setPersonData] = useState({
    fullName: "", gender: "male", birthYear: "", deathYear: "",
    birthPlace: "", isLiving: true, villageId: "", clanId: "", bio: "",
  });
  const [relationshipData, setRelationshipData] = useState({
    relatedPersonId: "", relatedPersonName: "", relationshipType: "parent", direction: "parent",
  });
  const [sourceData, setSourceData] = useState({
    title: "", type: "oral", reliability: "3",
  });

  const canAdvance = () => {
    if (step === 0) return true;
    if (step === 1) return personData.fullName.trim().length >= 2;
    if (step === 2) return true; // relationship optional
    if (step === 3) return sourceData.title.trim().length >= 3;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, personData, relationshipData, sourceData }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSuccess(true);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">Contribution Submitted!</h2>
        <p className="text-stone-500 dark:text-stone-400 mb-6">Your submission is pending review by a village administrator.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => { setSuccess(false); setStep(0); setPersonData({ fullName: "", gender: "male", birthYear: "", deathYear: "", birthPlace: "", isLiving: true, villageId: "", clanId: "", bio: "" }); }}
            className="px-4 py-2 text-sm font-medium border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Submit Another
          </button>
          <button onClick={() => router.push("/")}
            className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                i === step
                  ? "bg-amber-500 text-white"
                  : i < step
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 cursor-pointer"
                  : "bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 mx-1 ${i < step ? "bg-amber-300" : "bg-stone-200 dark:bg-stone-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
        {/* Step 0: Choose action */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">What would you like to do?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: "new_person" as Action, label: "Add a New Person", desc: "Add someone who isn't in the archive yet" },
                { value: "edit" as Action, label: "Edit a Record", desc: "Update or correct existing information" },
                { value: "add_relationship" as Action, label: "Add Relationship", desc: "Connect two existing people" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAction(opt.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    action === opt.value
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                      : "border-stone-200 dark:border-stone-700 hover:border-stone-300"
                  }`}
                >
                  <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">{opt.label}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Person details */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Person Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Full Name *</label>
                <input type="text" value={personData.fullName} onChange={(e) => setPersonData({ ...personData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  placeholder="e.g. Ghulam Raza" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Gender</label>
                <select value={personData.gender} onChange={(e) => setPersonData({ ...personData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Birth Year</label>
                <input type="number" value={personData.birthYear} onChange={(e) => setPersonData({ ...personData, birthYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
                  placeholder="e.g. 1950" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Birth Place</label>
                <input type="text" value={personData.birthPlace} onChange={(e) => setPersonData({ ...personData, birthPlace: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
                  placeholder="e.g. Karimabad" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isLiving" checked={personData.isLiving}
                  onChange={(e) => setPersonData({ ...personData, isLiving: e.target.checked, deathYear: e.target.checked ? "" : personData.deathYear })}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400" />
                <label htmlFor="isLiving" className="text-sm text-stone-700 dark:text-stone-300">Living</label>
              </div>
              {!personData.isLiving && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Death Year</label>
                  <input type="number" value={personData.deathYear} onChange={(e) => setPersonData({ ...personData, deathYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Village</label>
                <select value={personData.villageId} onChange={(e) => setPersonData({ ...personData, villageId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100">
                  <option value="">Select village</option>
                  {villages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Clan</label>
                <select value={personData.clanId} onChange={(e) => setPersonData({ ...personData, clanId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100">
                  <option value="">Select clan</option>
                  {clans.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Biography</label>
                <textarea value={personData.bio} onChange={(e) => setPersonData({ ...personData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none min-h-[80px] resize-y text-stone-900 dark:text-stone-100"
                  placeholder="Optional biographical notes..." />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Relationship */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">Relationship (Optional)</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Connect this person to an existing record. You can skip this step.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Relationship Type</label>
                <select value={relationshipData.relationshipType}
                  onChange={(e) => setRelationshipData({ ...relationshipData, relationshipType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100">
                  <option value="parent">Parent of this person</option>
                  <option value="child">Child of this person</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Related Person (Name)</label>
                <input type="text" value={relationshipData.relatedPersonName}
                  onChange={(e) => setRelationshipData({ ...relationshipData, relatedPersonName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
                  placeholder="Search by name..." />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Source */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">Source Citation *</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Every contribution must cite a source for verification.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Source Title *</label>
                <input type="text" value={sourceData.title}
                  onChange={(e) => setSourceData({ ...sourceData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
                  placeholder="e.g. Oral account from village elder" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Source Type</label>
                <select value={sourceData.type} onChange={(e) => setSourceData({ ...sourceData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100">
                  <option value="oral">Oral History</option>
                  <option value="document">Document</option>
                  <option value="nadra">NADRA Record</option>
                  <option value="book">Book/Publication</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Reliability (1-5)</label>
                <select value={sourceData.reliability} onChange={(e) => setSourceData({ ...sourceData, reliability: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100">
                  <option value="1">1 — Very Low</option>
                  <option value="2">2 — Low</option>
                  <option value="3">3 — Medium</option>
                  <option value="4">4 — High</option>
                  <option value="5">5 — Very High</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Review Your Submission</h2>
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Action</h3>
                <Badge variant="amber">{action === "new_person" ? "New Person" : action === "edit" ? "Edit Record" : "Add Relationship"}</Badge>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Person</h3>
                <p className="text-sm text-stone-900 dark:text-stone-100 font-medium">{personData.fullName}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {personData.gender} · {personData.birthYear ? `b. ${personData.birthYear}` : "Birth year unknown"}
                  {personData.birthPlace && ` · ${personData.birthPlace}`}
                </p>
              </div>
              <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
                <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Source</h3>
                <p className="text-sm text-stone-900 dark:text-stone-100">{sourceData.title}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{sourceData.type} · Reliability: {sourceData.reliability}/5</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="px-5 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Submit Contribution
          </button>
        )}
      </div>
    </div>
  );
}
