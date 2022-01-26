USE chat_data;

INSERT INTO User (id, name, image_url, friends) VALUES (
    5b6962dd-3f90-4c93-8f61-eabfa4a803e2,
    'Olivier',
    'default_profile_img',
    {}
);

INSERT INTO User (id, name, image_url, friends) VALUES (
    5b6962dd-3f90-4c93-8f61-eabfa4a803e1,
    'NotOlivier',
    'default_profile_img',
    {}
);


INSERT INTO User (id, name, image_url, friends) VALUES (
    5b6962dd-3f90-4c93-8f61-eabfa4a803e0,
    'NotNotOlivier',
    'default_profile_img',
    {}
);

INSERT INTO Conversation (id, users, title, icon) VALUES (
    f8e45fd7-0203-4b74-8c3b-3946bb9dec69,
    {
        5b6962dd-3f90-4c93-8f61-eabfa4a803e2,
        5b6962dd-3f90-4c93-8f61-eabfa4a803e1
    },
    'best convo',
    'default_conversation_img'
);
