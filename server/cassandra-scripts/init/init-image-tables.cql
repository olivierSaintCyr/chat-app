DROP TABLE Image;

CREATE TABLE IF NOT EXISTS chat_data.ImageFile (
    id UUID,
    path text,
    PRIMARY KEY (id, path)
);