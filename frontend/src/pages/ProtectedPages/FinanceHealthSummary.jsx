// pages/dashboard/FinanceHealthSummary.jsx
import React, { useEffect } from "react";
import { useGenAIStore } from "../../store/useGenAIStore";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const FinanceHealthSummary = () => {
  // Get the full user object from Redux
  const user = useSelector((state) => state.auth.user);
  const { genAIResponse, fetchGenAIResponse, loading } = useGenAIStore();
    console.log(genAIResponse)


  useEffect(() => {
    // Only fetch if user exists and AI data hasn't been fetched yet
    if (user?._id && !genAIResponse) {
      fetchGenAIResponse(user._id).catch(() =>
        toast.error("Failed to fetch AI insights")
      );
    }
  }, [user, genAIResponse, fetchGenAIResponse]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center">
          {/* Animated circle */}
          <div className="w-12 h-12 border-4 border-t-primary border-gray-300 rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-gray-400">Loading your Finance Health...</p>
        </div>
      </div>
    );

  if (!genAIResponse)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-xl text-gray-400">
          No Finance Health Summary available.
        </p>
      </div>
    );

  return (
<section className="w-full h-[90vh] md:h-[90vh] px-6 md:px-12 flex flex-col gap-6">
  <div>
    <h2 className="text-3xl text-pretty mt-3">
      Hello, {user?.username} 😊
    </h2>
    <h3 className="text-lg text-gray-500">
      Here's your personalized Finance Health Summary
    </h3>
  </div>

  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto flex flex-col gap-6">
    {/* Summary */}
    {genAIResponse.summary && (
      <div className="p-6 border-2 border-secondary rounded-lg">
        <h4 className="text-2xl font-bold mb-2">Summary</h4>
        <p className="text-base">{genAIResponse.summary}</p>
      </div>
    )}

    {/* Insights */}
    {genAIResponse.insights?.length > 0 && (
      <div className="p-6 border-2 border-secondary rounded-lg">
        <h4 className="text-2xl font-bold mb-2">Top Insights</h4>
        <ul className="list-disc list-inside space-y-1">
          {genAIResponse.insights.map((insight, idx) => (
            <li key={idx} className="text-base">
              {insight}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Recommendations */}
    {genAIResponse.recommendations?.length > 0 && (
      <div className="p-6 border-2 border-secondary rounded-lg">
        <h4 className="text-2xl font-bold mb-2">Recommendations</h4>
        <ul className="list-disc list-inside space-y-1">
          {genAIResponse.recommendations.map((rec, idx) => (
            <li key={idx} className="text-base">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
</section>

  );
};

export default FinanceHealthSummary;
