// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title DecentralizedTwitter
/// @notice On-chain microblog: profiles, posts (280 chars), likes, and author-only deletion.
contract DecentralizedTwitter {
    uint256 public constant MAX_POST_LENGTH = 280;
    uint256 public constant MIN_HANDLE_LENGTH = 3;
    uint256 public constant MAX_HANDLE_LENGTH = 15;

    struct Post {
        address author;
        string content;
        uint256 timestamp;
        uint256 likeCount;
        bool exists;
    }

    uint256 private _nextPostId;
    mapping(uint256 => Post) private _posts;
    mapping(uint256 => mapping(address => bool)) private _liked;

    mapping(address => string) public profileHandle;
    mapping(string => address) private _handleOwner;

    event ProfileUpdated(address indexed user, string handle);
    event PostCreated(
        uint256 indexed postId,
        address indexed author,
        string content,
        uint256 timestamp
    );
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 newLikeCount);
    event PostUnliked(uint256 indexed postId, address indexed liker, uint256 newLikeCount);
    event PostDeleted(uint256 indexed postId, address indexed author);

    error EmptyContent();
    error ContentTooLong();
    error PostNotFound();
    error AlreadyLiked();
    error NotLiked();
    error NotPostAuthor();
    error HandleTaken();
    error InvalidHandle();

    function setProfile(string calldata handle) external {
        _validateHandle(handle);
        address currentOwner = _handleOwner[handle];
        if (currentOwner != address(0) && currentOwner != msg.sender) {
            revert HandleTaken();
        }
        string memory previous = profileHandle[msg.sender];
        if (bytes(previous).length > 0) {
            _handleOwner[previous] = address(0);
        }
        profileHandle[msg.sender] = handle;
        _handleOwner[handle] = msg.sender;
        emit ProfileUpdated(msg.sender, handle);
    }

    function createPost(string calldata content) external returns (uint256 postId) {
        bytes memory raw = bytes(content);
        if (raw.length == 0) revert EmptyContent();
        if (raw.length > MAX_POST_LENGTH) revert ContentTooLong();

        postId = ++_nextPostId;
        _posts[postId] = Post({
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            likeCount: 0,
            exists: true
        });
        emit PostCreated(postId, msg.sender, content, block.timestamp);
    }

    function likePost(uint256 postId) external {
        Post storage postRef = _posts[postId];
        if (!postRef.exists) revert PostNotFound();
        if (_liked[postId][msg.sender]) revert AlreadyLiked();
        _liked[postId][msg.sender] = true;
        postRef.likeCount += 1;
        emit PostLiked(postId, msg.sender, postRef.likeCount);
    }

    function unlikePost(uint256 postId) external {
        Post storage postRef = _posts[postId];
        if (!postRef.exists) revert PostNotFound();
        if (!_liked[postId][msg.sender]) revert NotLiked();
        _liked[postId][msg.sender] = false;
        postRef.likeCount -= 1;
        emit PostUnliked(postId, msg.sender, postRef.likeCount);
    }

    function deletePost(uint256 postId) external {
        Post storage postRef = _posts[postId];
        if (!postRef.exists) revert PostNotFound();
        if (postRef.author != msg.sender) revert NotPostAuthor();
        delete _posts[postId];
        emit PostDeleted(postId, msg.sender);
    }

    function getPost(uint256 postId)
        external
        view
        returns (
            address author,
            string memory content,
            uint256 timestamp,
            uint256 likeCount,
            bool exists
        )
    {
        Post storage p = _posts[postId];
        return (p.author, p.content, p.timestamp, p.likeCount, p.exists);
    }

    function hasLiked(address user, uint256 postId) external view returns (bool) {
        return _liked[postId][user];
    }

    function postCount() external view returns (uint256) {
        return _nextPostId;
    }

    function _validateHandle(string calldata handle) private pure {
        bytes memory b = bytes(handle);
        uint256 len = b.length;
        if (len < MIN_HANDLE_LENGTH || len > MAX_HANDLE_LENGTH) revert InvalidHandle();
        for (uint256 i = 0; i < len; i++) {
            bytes1 c = b[i];
            bool isDigit = c >= 0x30 && c <= 0x39;
            bool isUpper = c >= 0x41 && c <= 0x5A;
            bool isLower = c >= 0x61 && c <= 0x7A;
            bool isUnderscore = c == 0x5F;
            if (!isDigit && !isUpper && !isLower && !isUnderscore) revert InvalidHandle();
        }
    }
}
