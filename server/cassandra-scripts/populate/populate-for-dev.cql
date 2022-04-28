USE chat_data;

INSERT INTO User (id, name, image_url, friends, conversations) VALUES (
    5b6962dd-3f90-4c93-8f61-eabfa4a803e2,
    'Olivier',
    'profile-pictures/default',
    {},
    {f8e45fd7-0203-4b74-8c3b-3946bb9dec69}
);

INSERT INTO User (id, name, image_url, friends, conversations) VALUES (
    5b6962dd-3f90-4c93-8f61-eabfa4a803e1,
    'NotOlivier',
    'profile-pictures/default',
    {},
    {f8e45fd7-0203-4b74-8c3b-3946bb9dec69}
);


INSERT INTO User (id, name, image_url, friends, conversations) VALUES (
    5b6962dd-3f90-4c93-8f61-eabfa4a803e0,
    'NotNotOlivier',
    'profile-pictures/default',
    {},
    {}
);

INSERT INTO Conversation (id, users, title, icon, last_message_date) VALUES (
    f8e45fd7-0203-4b74-8c3b-3946bb9dec69,
    {
        5b6962dd-3f90-4c93-8f61-eabfa4a803e2,
        5b6962dd-3f90-4c93-8f61-eabfa4a803e1
    },
    'best convo',
    'profile-pictures/default',
    0
);
