import os

import boto3
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

AWS_BEARER_TOKEN_BEDROCK = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
MODEL_ID = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

TRAVEL_PLANNER_PROMPT = (
    "You are an experienced travel planner.\n"
    "Plan a {days}-day itinerary for {destination}.\n"
    "Budget: USD {budget}\n"
    "Travel Style: {travel_style}.\n"
    "Give the answer with markdown format."
)


def get_bedrock_client():
    """
    Build and return a boto3 Bedrock Runtime client.

    Authentication uses the inline Bedrock API key stored in
    AWS_BEARER_TOKEN_BEDROCK.  boto3 accepts this through the
    ``aws_bearer_token`` token provider introduced in botocore 1.35+.
    """
    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError(
            "AWS_BEARER_TOKEN_BEDROCK is not set. "
            "Check your .env file."
        )

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
        # aws_access_key_id="BEARER",        # placeholder required by boto3
        # aws_secret_access_key="BEARER",    # placeholder required by boto3
        # aws_session_token=AWS_BEARER_TOKEN_BEDROCK,
    )
    return client


def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
) -> str:
    """
    Call Amazon Bedrock with the travel-planner prompt and return the
    AI-generated itinerary as a plain string.

    Args:
        destination:  City / country the traveller is visiting.
        days:         Length of the trip in days.
        budget:       Total budget in USD.
        travel_style: Free-text style description (e.g. "backpacker", "luxury", "family").
        daily_itenary: Sequence of activities that can be undertaken or the tourist destinations that can be visited.
        estimated_daily_budget: Total budget spent/required daily in USD
        local_food_recommendations: Recommend local foods that can be enjoyed or purchased.
        transportation_suggestions: Recommend local modes of transportation that can be used to travel from one location to another.

    Returns:
        The model's text response.

    Raises:
        ValueError: If required environment variables are missing.
        Exception:  Propagated from boto3 / Bedrock on API errors.
    """
    prompt = TRAVEL_PLANNER_PROMPT.format(
        days=days,
        destination=destination,
        budget=budget,
        travel_style=travel_style,
    )

    client = get_bedrock_client()

    # Use the Converse API — works across all Nova / Titan / Claude models
    response = client.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
    )

    # Extract the assistant's reply text
    output_message = response["output"]["message"]
    text_parts = [
        block["text"]
        for block in output_message["content"]
        if "text" in block
    ]
    return "\n".join(text_parts)

CHAT_SYSTEM_PROMPT = (
    "You are KelanaAI, a friendly and knowledgeable travel assistant. "
    "Help the user with travel questions, itinerary ideas, packing tips, "
    "visa requirements, budgeting, and anything travel-related. "
    "Be concise, practical, and encouraging."
)

RAG_SYSTEM_PROMPT = (
    "You are KelanaAI, a travel assistant. "
    "Answer the user's question using ONLY the context excerpts provided below. "
    "If the context does not contain enough information, say so honestly. "
    "Cite the relevant parts of the context when possible."
)


def chat_direct(message: str, history: list[dict] | None = None) -> str:
    """
    Send a message (with optional prior history) directly to the LLM.

    Args:
        message: The latest user message.
        history: List of {"role": "user"|"assistant", "content": str} dicts,
                 oldest first, NOT including the current message.

    Returns:
        The model's reply as a plain string.
    """
    client = get_bedrock_client()

    messages = []
    for turn in (history or []):
        messages.append({
            "role": turn["role"],
            "content": [{"text": turn["content"]}],
        })
    messages.append({"role": "user", "content": [{"text": message}]})

    response = client.converse(
        modelId=MODEL_ID,
        system=[{"text": CHAT_SYSTEM_PROMPT}],
        messages=messages,
    )

    output_message = response["output"]["message"]
    return "\n".join(
        block["text"]
        for block in output_message["content"]
        if "text" in block
    )


def chat_with_context(
    question: str,
    context: str,
    sources: list[dict] | None = None,
    history: list[dict] | None = None,
) -> str:
    """
    Answer a question grounded in KB-retrieved context (RAG mode).

    Args:
        question: The user's question.
        context:  Concatenated text snippets from the knowledge base.
        sources:  Optional list of source metadata (included in prompt for transparency).
        history:  Prior conversation turns (oldest first, excluding current question).

    Returns:
        The model's grounded reply as a plain string.
    """
    client = get_bedrock_client()

    source_note = ""
    if sources:
        source_labels = [
            s.get("document_id") or str(s.get("location", ""))
            for s in sources[:3]
        ]
        source_note = "\n\nSources: " + ", ".join(filter(None, source_labels))

    augmented_question = (
        f"Context from knowledge base:\n{context}{source_note}\n\n"
        f"User question: {question}"
    )

    messages = []
    for turn in (history or []):
        messages.append({
            "role": turn["role"],
            "content": [{"text": turn["content"]}],
        })
    messages.append({"role": "user", "content": [{"text": augmented_question}]})

    response = client.converse(
        modelId=MODEL_ID,
        system=[{"text": RAG_SYSTEM_PROMPT}],
        messages=messages,
    )

    output_message = response["output"]["message"]
    return "\n".join(
        block["text"]
        for block in output_message["content"]
        if "text" in block
    )
