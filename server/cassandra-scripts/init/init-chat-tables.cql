CREATE KEYSPACE IF NOT EXISTS chat_data
    WITH REPLICATION = { 
        'class' : 'SimpleStrategy', 
        'replication_factor' : 1 
    };

DROP TABLE IF EXISTS chat_data.Message;
DROP TABLE IF EXISTS chat_data.User;
DROP TABLE IF EXISTS chat_data.Conversation; 

CREATE TABLE IF NOT EXISTS chat_data.Message (
    id UUID,
    conversation UUID,
    author UUID,
    content text,
    sent_date timestamp,
    PRIMARY KEY(conversation, sent_date, id)
);

CREATE TABLE IF NOT EXISTS chat_data.User (
    id UUID PRIMARY KEY,
    name text,
    image_url text,
    friends set<UUID>,
    conversations set<UUID>
);

CREATE TABLE IF NOT EXISTS chat_data.Conversation (
    id UUID,
    last_message_date timestamp,
    last_message UUID,
    users set<UUID>,
    title text,
    icon text,
    PRIMARY KEY(id)
);
