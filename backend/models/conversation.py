from sqlalchemy import Column, BigInteger, Text, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id         = Column(BigInteger, primary_key=True, index=True)
    user_id    = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False)
    title      = Column(String(120), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False)

    messages = relationship(
        "Message",
        back_populates="conversation",
        order_by="Message.created_at",
    )


class Message(Base):
    __tablename__ = "messages"

    id              = Column(BigInteger, primary_key=True, index=True)
    conversation_id = Column(BigInteger, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role            = Column(String(16), nullable=False)   # "user" | "assistant"
    content         = Column(Text, nullable=False)
    created_at      = Column(DateTime(timezone=True))

    conversation = relationship("Conversation", back_populates="messages")
